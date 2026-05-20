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

export async function getChannelArticles(shortHash, { first = 24 } = {}) {
  const data = await queryMatters(CHANNEL_ARTICLES, {
    shortHash,
    first,
  })

  return normalizeChannel(data.channel)
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
