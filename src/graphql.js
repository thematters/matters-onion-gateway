import { config } from './config.js'
import { createTtlCache } from './cache.js'
import { createSemaphore } from './semaphore.js'

// Global limits, by design: all Tor traffic arrives from the local Tor daemon, so
// these protect the single instance and the Matters backend rather than any one IP.
const upstreamSemaphore = createSemaphore(config.maxUpstreamConcurrency)
const feedCache = createTtlCache()

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
  query SearchArticles($key: String!) {
    search(input: { key: $key, type: Article, first: 20, record: false }) {
      totalCount
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
  query ChannelArticles($shortHash: String!, $first: Int) {
    channel(input: { shortHash: $shortHash }) {
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

const AUTHOR_BY_USERNAME = `
  query AuthorByUserName($userName: String!) {
    user(input: { userName: $userName, userNameCaseIgnore: true }) {
      ${AUTHOR_FIELDS}
      articles(input: { first: 24 }) {
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

export function queryMatters(query, variables = {}) {
  // Bound concurrent upstream requests; the timeout starts only after a slot is
  // acquired so queued requests are not penalized for waiting.
  return upstreamSemaphore.run(() => runQuery(query, variables))
}

async function runQuery(query, variables) {
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

export async function searchArticles(key, { first = 20 } = {}) {
  const data = await queryMatters(SEARCH_ARTICLES, {
    key,
  })

  return {
    totalCount: data.search?.totalCount || 0,
    articles: filterPublicArticles(
      (data.search?.edges || [])
        .map((edge) => edge?.node)
        .filter((node) => node?.__typename === 'Article')
    ).slice(0, first),
  }
}

export function getHomeFeed({ firstPerChannel = 6, limit = 24 } = {}) {
  return feedCache.get(`home:${firstPerChannel}:${limit}`, config.feedCacheTtlMs, () =>
    loadHomeFeed({ firstPerChannel, limit })
  )
}

async function loadHomeFeed({ firstPerChannel, limit }) {
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

export function getChannelArticles(shortHash, { first = 24 } = {}) {
  return feedCache.get(`channel:${shortHash}:${first}`, config.feedCacheTtlMs, () =>
    loadChannelArticles(shortHash, first)
  )
}

async function loadChannelArticles(shortHash, first) {
  const data = await queryMatters(CHANNEL_ARTICLES, {
    shortHash,
    first,
  })

  return normalizeChannel(data.channel)
}

export async function getAuthorByUserName(userName) {
  const data = await queryMatters(AUTHOR_BY_USERNAME, {
    userName,
  })

  return normalizeAuthor(data.user)
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
    articles: filterPublicArticles(
      (user.articles?.edges || []).map((edge) => edge?.node).filter(Boolean)
    ),
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

    // noindex articles are hidden entirely from every discovery surface.
    if (article.noindex) {
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
