import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config } from './config.js'
import { identifyArticleInput } from './identify.js'
import {
  getAuthorByUserName,
  getArticleByIdentifier,
  getChannelArticles,
  getHomeFeed,
  searchAuthors,
  searchArticles,
} from './graphql.js'
import { isDefaultLanguage, resolveLanguage } from './i18n.js'
import { fetchIpfsCid } from './ipfs.js'
import { sanitizeArticleHtml } from './sanitize.js'
import { articleView, channelView, discoverView, errorView, homeView, searchView, whyOnionView } from './views.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const securityHeaders = {
  'content-security-policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; frame-src 'none'; connect-src 'self'; form-action 'self'; base-uri 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

export async function handleRequest(request) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  const lang = resolveLanguage({ searchParams: url.searchParams, headers: request.headers })

  if (request.method !== 'GET') {
    return respond(errorView({ messageKey: 'methodNotAllowed', status: 405, lang }))
  }

  if (url.pathname === '/') {
    return handleHome(lang)
  }

  if (url.pathname === '/styles.css') {
    const css = await readFile(join(publicDir, 'styles.css'), 'utf8')
    return respond({
      status: 200,
      headers: { 'content-type': 'text/css; charset=utf-8' },
      body: css,
    })
  }

  if (url.pathname === '/images/onion-hero.jpg' || url.pathname === '/images/onion-hero-square.jpg') {
    const fileName = url.pathname.endsWith('onion-hero-square.jpg')
      ? 'onion-hero-square.jpg'
      : 'onion-hero.jpg'
    return respond({
      status: 200,
      headers: {
        'content-type': 'image/jpeg',
        'cache-control': 'public, max-age=86400',
      },
      body: await readFile(join(publicDir, 'images', fileName)),
    })
  }

  if (url.pathname === '/healthz') {
    return respond({
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: true }),
    })
  }

  if (url.pathname === '/favicon.ico') {
    return respond({
      status: 204,
      body: '',
    })
  }

  if (url.pathname === '/article') {
    return handleArticleLookup(url.searchParams.get('q') || '', lang)
  }

  if (url.pathname === '/discover') {
    return handleDiscover(url.searchParams.get('q') || '', lang)
  }

  if (url.pathname === '/why-onion') {
    return respond(whyOnionView({ lang }))
  }

  if (url.pathname === '/search') {
    return handleSearch(url.searchParams.get('q') || '', lang)
  }

  if (url.pathname === '/author') {
    return handleAuthorSearch(url.searchParams.get('q') || '', lang)
  }

  const authorPathMatch = url.pathname.match(/^\/author\/([^/]+)$/)
  if (authorPathMatch) {
    return handleAuthor(decodeURIComponent(authorPathMatch[1]), lang)
  }

  const channelPathMatch = url.pathname.match(/^\/channel\/([^/]+)$/)
  if (channelPathMatch) {
    return handleChannel(channelPathMatch[1], lang)
  }

  const articlePathMatch = url.pathname.match(/^\/article\/([^/]+)$/)
  if (articlePathMatch) {
    return handleArticleLookup(articlePathMatch[1], lang)
  }

  const ipfsMatch = url.pathname.match(/^\/ipfs\/([^/]+)$/)
  if (ipfsMatch) {
    return handleIpfs(ipfsMatch[1], lang)
  }

  if (url.pathname === '/proxy/image') {
    return handleImageProxy(url.searchParams.get('url') || '', lang)
  }

  return respond(errorView({ messageKey: 'notFound', status: 404, lang }))
}

async function handleHome(lang) {
  const feed = await getHomeFeed()
  return respond(homeView({ ...feed, lang }))
}

async function handleSearch(query, lang) {
  const key = query.trim()

  if (!key) {
    const feed = await getHomeFeed()
    return respond(homeView({ ...feed, lang, searchErrorKey: 'enterSearch' }))
  }

  const result = await searchArticles(key)
  return respond(searchView({ query: key, result, lang }))
}

async function handleDiscover(query, lang) {
  const key = query.trim()

  if (!key) {
    const feed = await getHomeFeed()
    return respond(homeView({ ...feed, lang, searchErrorKey: 'enterSearch' }))
  }

  const identifier = identifyArticleInput(key)

  if (identifier.type === 'cid') {
    return redirect(withLang(`/ipfs/${encodeURIComponent(identifier.value)}`, lang))
  }

  if (identifier.type === 'shortHash') {
    return redirect(withLang(`/article/${encodeURIComponent(identifier.value)}`, lang))
  }

  if (identifier.type === 'mediaHash') {
    return redirect(withLang(`/article?q=${encodeURIComponent(key)}`, lang))
  }

  const direct = await getAuthorByUserName(key)
  if (direct?.userName) {
    return redirect(withLang(`/author/${encodeURIComponent(direct.userName)}`, lang))
  }

  const [articleResult, authorResult] = await Promise.all([
    searchArticles(key),
    searchAuthors(key),
  ])
  const exact = findExactAuthor(authorResult.authors, key)

  if (exact?.userName) {
    return redirect(withLang(`/author/${encodeURIComponent(exact.userName)}`, lang))
  }

  return respond(discoverView({ query: key, articleResult, authorResult, lang }))
}

async function handleAuthorSearch(query, lang) {
  const key = query.trim()

  if (!key) {
    const feed = await getHomeFeed()
    return respond(homeView({ ...feed, lang, authorErrorKey: 'enterAuthor' }))
  }

  const direct = await getAuthorByUserName(key)
  if (direct?.userName) {
    return redirect(withLang(`/author/${encodeURIComponent(direct.userName)}`, lang))
  }

  const result = await searchAuthors(key)
  const exact = findExactAuthor(result.authors, key)

  if (exact?.userName) {
    return redirect(withLang(`/author/${encodeURIComponent(exact.userName)}`, lang))
  }

  if (result.authors.length === 1 && result.authors[0].userName) {
    return redirect(withLang(`/author/${encodeURIComponent(result.authors[0].userName)}`, lang))
  }

  return respond(searchView({ query: key, authorResult: result, lang, mode: 'authors' }))
}

function findExactAuthor(authors, key) {
  const normalizedKey = key.toLocaleLowerCase()
  return authors.find((author) => (
    author.userName?.toLocaleLowerCase() === normalizedKey ||
    author.displayName?.toLocaleLowerCase() === normalizedKey
  ))
}

async function handleAuthor(userName, lang) {
  const author = await getAuthorByUserName(userName)

  if (!author) {
    return respond(errorView({ messageKey: 'noSearchResults', status: 404, lang }))
  }

  return respond(searchView({ query: author.displayName || author.userName, author, lang, mode: 'author' }))
}

async function handleChannel(shortHash, lang) {
  const channel = await getChannelArticles(shortHash)

  if (!channel) {
    return respond(errorView({ messageKey: 'channelNotFound', status: 404, lang }))
  }

  return respond(channelView({ channel, lang }))
}

async function handleArticleLookup(input, lang) {
  const identifier = identifyArticleInput(input)

  if (identifier.type === 'empty') {
    const feed = await getHomeFeed()
    return respond(homeView({ ...feed, lang, errorKey: 'enterArticle' }))
  }

  if (identifier.type === 'unknown') {
    return respond(homeView({ lang, value: input, error: 'Input format is not recognized.' }))
  }

  if (identifier.type === 'cid') {
    return redirect(withLang(`/ipfs/${encodeURIComponent(identifier.value)}`, lang))
  }

  const article = await getArticleByIdentifier(identifier)

  if (!article) {
    return respond(errorView({ messageKey: 'articleNotFound', status: 404, lang }))
  }

  if (article.state && article.state !== 'active') {
    return respond(errorView({ messageKey: 'articleNotActive', status: 403, lang }))
  }

  if (article.access?.type && article.access.type !== 'public') {
    return respond(errorView({ messageKey: 'articleNotPublic', status: 403, lang }))
  }

  const html = sanitizeArticleHtml(article.contents?.html || '')
  return respond(articleView({ article, html, sourceInput: input, lang }))
}

async function handleIpfs(cid, lang) {
  try {
    const upstream = await fetchIpfsCid(cid)
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'

    return respond({
      status: upstream.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=600',
      },
      body: Buffer.from(await upstream.arrayBuffer()),
    })
  } catch {
    return respond(errorView({ messageKey: 'ipfsUnavailable', status: 502, lang }))
  }
}

async function handleImageProxy(sourceUrl, lang) {
  if (!sourceUrl) {
    return respond(errorView({ message: 'Missing image URL', status: 400, lang }))
  }

  let parsed
  try {
    parsed = new URL(sourceUrl)
  } catch {
    return respond(errorView({ message: 'Invalid image URL', status: 400, lang }))
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return respond(errorView({ message: 'Unsupported image URL', status: 400, lang }))
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs)

  try {
    const upstream = await fetch(parsed, {
      headers: { accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*' },
      signal: controller.signal,
    })

    if (!upstream.ok) {
      return respond(errorView({ message: 'Image is unavailable', status: 502, lang }))
    }

    const contentLength = Number(upstream.headers.get('content-length') || 0)
    if (contentLength > config.imageProxyMaxBytes) {
      return respond(errorView({ message: 'Image is too large', status: 413, lang }))
    }

    const contentType = upstream.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return respond(errorView({ message: 'Remote resource is not an image', status: 415, lang }))
    }

    return respond({
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600',
      },
      body: Buffer.from(await upstream.arrayBuffer()),
    })
  } catch {
    return respond(errorView({ message: 'Image proxy failed', status: 502, lang }))
  } finally {
    clearTimeout(timeout)
  }
}

function withLang(path, lang) {
  if (isDefaultLanguage(lang)) {
    return path
  }

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}lang=${encodeURIComponent(lang)}`
}

function redirect(location) {
  return respond({
    status: 302,
    headers: { location },
    body: '',
  })
}

function respond(response) {
  return {
    status: response.status || 200,
    headers: {
      ...securityHeaders,
      ...response.headers,
    },
    body: response.body || '',
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer(async (req, res) => {
    try {
      const response = await handleRequest(req)
      res.writeHead(response.status, response.headers)
      res.end(response.body)
    } catch {
      const response = respond(errorView({ message: 'Internal server error', status: 500 }))
      res.writeHead(response.status, response.headers)
      res.end(response.body)
    }
  })

  server.listen(config.port, '127.0.0.1', () => {
    console.log(`Matters Onion Reader listening on http://127.0.0.1:${config.port}`)
  })
}
