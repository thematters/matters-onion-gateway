import { config } from './config.js'

const ARTICLE_FIELDS = `
  id
  title
  slug
  shortHash
  dataHash
  mediaHash
  state
  summary
  createdAt
  revisedAt
  language
  license
  noindex
  cover
  displayCover
  author {
    id
    userName
    displayName
  }
  tags {
    id
    content
  }
  access {
    type
  }
  contents {
    html
    markdown
  }
`

const ARTICLE_LIST_FIELDS = `
  id
  title
  shortHash
  summary
  createdAt
  revisedAt
  state
  noindex
  author {
    id
    userName
    displayName
  }
  access {
    type
  }
`

const AUTHOR_FIELDS = `
  id
  userName
  displayName
  avatar
  info {
    description
    profileCover
    ipnsKey
  }
`

const ARTICLE_BY_SHORT_HASH = `
  query ArticleByShortHash($shortHash: String) {
    article(input: { shortHash: $shortHash }) {
      ${ARTICLE_FIELDS}
    }
  }
`

const ARTICLE_BY_MEDIA_HASH = `
  query ArticleByMediaHash($mediaHash: String) {
    article(input: { mediaHash: $mediaHash }) {
      ${ARTICLE_FIELDS}
    }
  }
`

const SEARCH_ARTICLES = `
  query SearchArticles($key: String!, $after: String) {
    search(input: { key: $key, type: Article, first: 20, after: $after, record: false }) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          __typename
          ... on Article {
            ${ARTICLE_LIST_FIELDS}
          }
        }
      }
    }
  }
`

const ACTIVE_CHANNELS_WITH_ARTICLES = `
  query ActiveChannelsWithArticles($first: Int) {
    channels {
      id
      shortHash
      navbarTitle
      ... on TopicChannel {
        articles(input: { first: $first }) {
          edges {
            node {
              ${ARTICLE_LIST_FIELDS}
            }
          }
        }
      }
      ... on CurationChannel {
        articles(input: { first: $first }) {
          edges {
            node {
              ${ARTICLE_LIST_FIELDS}
            }
          }
        }
      }
    }
  }
`

const CHANNEL_ARTICLES = `
  query ChannelArticles($shortHash: String!, $first: Int, $after: String) {
    channel(input: { shortHash: $shortHash }) {
      id
      shortHash
      navbarTitle
      ... on TopicChannel {
        articles(input: { first: $first, after: $after }) {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ${ARTICLE_LIST_FIELDS}
            }
          }
        }
      }
      ... on CurationChannel {
        articles(input: { first: $first, after: $after }) {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ${ARTICLE_LIST_FIELDS}
            }
          }
        }
      }
    }
  }
`

const AUTHOR_BY_USERNAME = `
  query AuthorByUserName($userName: String!, $after: String) {
    user(input: { userName: $userName, userNameCaseIgnore: true }) {
      ${AUTHOR_FIELDS}
      articles(input: { first: 24, after: $after }) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ${ARTICLE_LIST_FIELDS}
          }
        }
      }
    }
  }
`

const SEARCH_AUTHORS = `
  query SearchAuthors($key: String!) {
    search(input: { key: $key, type: User, first: 10, record: false }) {
      totalCount
      edges {
        node {
          __typename
          ... on User {
            ${AUTHOR_FIELDS}
          }
        }
      }
    }
  }
`

const TAG_ARTICLES = `
  query TagArticles($id: ID!, $after: String) {
    node(input: { id: $id }) {
      __typename
      ... on Tag {
        id
        content
        numArticles
        articles(input: { first: 24, after: $after }) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ${ARTICLE_LIST_FIELDS}
            }
          }
        }
      }
    }
  }
`

export async function queryMatters(query, variables = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs)

  try {
    const response = await fetch(config.mattersGraphqlEndpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(`Matters GraphQL returned HTTP ${response.status}`)
    }

    if (!payload || payload.errors?.length) {
      const message = payload?.errors?.[0]?.message || 'Unknown GraphQL error'
      throw new Error(message)
    }

    return payload.data
  } finally {
    clearTimeout(timeout)
  }
}

export async function getArticleByIdentifier(identifier) {
  if (identifier.type === 'shortHash') {
    const data = await queryMatters(ARTICLE_BY_SHORT_HASH, {
      shortHash: identifier.value,
    })
    return data.article
  }

  if (identifier.type === 'mediaHash') {
    const data = await queryMatters(ARTICLE_BY_MEDIA_HASH, {
      mediaHash: identifier.value,
    })
    return data.article
  }

  return null
}

export async function searchArticles(key, { after = null } = {}) {
  // Search page size is fixed at 20: the upstream `first` arg uses a constrained
  // scalar that cannot be bound to a plain Int variable, so it is inlined above.
  const data = await queryMatters(SEARCH_ARTICLES, {
    key,
    after,
  })

  return {
    totalCount: data.search?.totalCount || 0,
    pageInfo: extractPageInfo(data.search),
    articles: filterPublicArticles(
      (data.search?.edges || [])
        .map((edge) => edge?.node)
        .filter((node) => node?.__typename === 'Article')
    ),
  }
}

export async function getHomeFeed({ firstPerChannel = 6, limit = 24 } = {}) {
  const data = await queryMatters(ACTIVE_CHANNELS_WITH_ARTICLES, {
    first: firstPerChannel,
  })

  const channels = (data.channels || []).map(normalizeChannel).filter(Boolean)
  const articles = uniqueArticles(
    channels.flatMap((channel) =>
      channel.articles.map((article) => ({
        ...article,
        channel: {
          shortHash: channel.shortHash,
          title: channel.title,
        },
      }))
    )
  )
    .sort(sortNewestFirst)
    .slice(0, limit)

  return { channels, articles }
}

export async function getChannelArticles(shortHash, { first = 24, after = null } = {}) {
  const data = await queryMatters(CHANNEL_ARTICLES, {
    shortHash,
    first,
    after,
  })

  return normalizeChannel(data.channel)
}

export async function getAuthorByUserName(userName, { after = null } = {}) {
  // Author article page size is fixed at 24: the upstream `first` arg uses a
  // constrained scalar that cannot be bound to a plain Int variable.
  const data = await queryMatters(AUTHOR_BY_USERNAME, {
    userName,
    after,
  })

  return normalizeAuthor(data.user)
}

export async function getTagArticles(id, { after = null } = {}) {
  // Tag article page size is fixed at 24: the upstream `first` arg uses a
  // constrained scalar that cannot be bound to a plain Int variable.
  let data
  try {
    data = await queryMatters(TAG_ARTICLES, { id, after })
  } catch {
    // A malformed or unknown global id makes the node lookup fail upstream;
    // treat that as a missing tag rather than a server error.
    return null
  }

  const tag = data.node
  if (!tag || tag.__typename !== 'Tag') {
    return null
  }

  return {
    id: tag.id,
    content: tag.content,
    numArticles: tag.numArticles || 0,
    pageInfo: extractPageInfo(tag.articles),
    articles: filterPublicArticles(
      (tag.articles?.edges || []).map((edge) => edge?.node).filter(Boolean)
    ),
  }
}

export async function searchAuthors(key) {
  const data = await queryMatters(SEARCH_AUTHORS, {
    key,
  })

  return {
    totalCount: data.search?.totalCount || 0,
    authors: (data.search?.edges || [])
      .map((edge) => edge?.node)
      .filter((node) => node?.__typename === 'User')
      .map(normalizeAuthor)
      .filter(Boolean),
  }
}

function normalizeChannel(channel) {
  if (!channel) {
    return null
  }

  return {
    id: channel.id,
    shortHash: channel.shortHash,
    title: channel.navbarTitle,
    pageInfo: extractPageInfo(channel.articles),
    articles: filterPublicArticles(
      (channel.articles?.edges || []).map((edge) => edge?.node).filter(Boolean)
    ),
  }
}

function normalizeAuthor(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    userName: user.userName,
    displayName: user.displayName,
    avatar: user.avatar,
    description: user.info?.description || '',
    profileCover: user.info?.profileCover || '',
    ipnsKey: user.info?.ipnsKey || '',
    pageInfo: extractPageInfo(user.articles),
    articles: filterPublicArticles(
      (user.articles?.edges || []).map((edge) => edge?.node).filter(Boolean)
    ),
  }
}

// Normalize a GraphQL connection's pageInfo to the subset the views need.
function extractPageInfo(connection) {
  return {
    endCursor: connection?.pageInfo?.endCursor || null,
    hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
  }
}

function filterPublicArticles(articles) {
  return articles.filter((article) => {
    if (!article) {
      return false
    }

    if (article.state && article.state !== 'active') {
      return false
    }

    if (article.access?.type && article.access.type !== 'public') {
      return false
    }

    return true
  })
}

function uniqueArticles(articles) {
  const seen = new Set()
  const result = []

  for (const article of articles) {
    const key = article.shortHash || article.id
    if (!key || seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(article)
  }

  return result
}

function sortNewestFirst(left, right) {
  return dateValue(right.createdAt) - dateValue(left.createdAt)
}

function dateValue(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}
