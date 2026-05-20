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
