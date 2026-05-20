import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config } from './config.js'
import { identifyArticleInput } from './identify.js'
import { getArticleByIdentifier } from './graphql.js'
import { fetchIpfsCid } from './ipfs.js'
import { sanitizeArticleHtml } from './sanitize.js'
import { articleView, errorView, homeView } from './views.js'

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

  if (request.method !== 'GET') {
    return respond(errorView('Method not allowed', 405))
  }

  if (url.pathname === '/') {
    return respond(homeView())
  }

  if (url.pathname === '/styles.css') {
    const css = await readFile(join(publicDir, 'styles.css'), 'utf8')
    return respond({
      status: 200,
      headers: { 'content-type': 'text/css; charset=utf-8' },
      body: css,
    })
  }

  if (url.pathname === '/healthz') {
    return respond({
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: true }),
    })
  }

  if (url.pathname === '/article') {
    return handleArticleLookup(url.searchParams.get('q') || '')
  }

  const articlePathMatch = url.pathname.match(/^\/article\/([^/]+)$/)
  if (articlePathMatch) {
    return handleArticleLookup(articlePathMatch[1])
  }

  const ipfsMatch = url.pathname.match(/^\/ipfs\/([^/]+)$/)
  if (ipfsMatch) {
    return handleIpfs(ipfsMatch[1])
  }

  if (url.pathname === '/proxy/image') {
    return handleImageProxy(url.searchParams.get('url') || '')
  }

  return respond(errorView('Not found', 404))
}

async function handleArticleLookup(input) {
  const identifier = identifyArticleInput(input)

  if (identifier.type === 'empty') {
    return respond(homeView({ error: 'Enter a Matters article URL or hash.' }))
  }

  if (identifier.type === 'unknown') {
    return respond(homeView({ value: input, error: 'Input format is not recognized.' }))
  }

  if (identifier.type === 'cid') {
    return redirect(`/ipfs/${encodeURIComponent(identifier.value)}`)
  }

  const article = await getArticleByIdentifier(identifier)

  if (!article) {
    return respond(errorView('Article not found', 404))
  }

  if (article.state && article.state !== 'active') {
    return respond(errorView('Article is not active', 403))
  }

  if (article.access?.type && article.access.type !== 'public') {
    return respond(errorView('Article is not public', 403))
  }

  const html = sanitizeArticleHtml(article.contents?.html || '')
  return respond(articleView({ article, html, sourceInput: input }))
}

async function handleIpfs(cid) {
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
    return respond(errorView('IPFS content is unavailable from configured gateways.', 502))
  }
}

async function handleImageProxy(sourceUrl) {
  if (!sourceUrl) {
    return respond(errorView('Missing image URL', 400))
  }

  let parsed
  try {
    parsed = new URL(sourceUrl)
  } catch {
    return respond(errorView('Invalid image URL', 400))
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return respond(errorView('Unsupported image URL', 400))
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs)

  try {
    const upstream = await fetch(parsed, {
      headers: { accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*' },
      signal: controller.signal,
    })

    if (!upstream.ok) {
      return respond(errorView('Image is unavailable', 502))
    }

    const contentLength = Number(upstream.headers.get('content-length') || 0)
    if (contentLength > config.imageProxyMaxBytes) {
      return respond(errorView('Image is too large', 413))
    }

    const contentType = upstream.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return respond(errorView('Remote resource is not an image', 415))
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
    return respond(errorView('Image proxy failed', 502))
  } finally {
    clearTimeout(timeout)
  }
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
      const response = respond(errorView('Internal server error', 500))
      res.writeHead(response.status, response.headers)
      res.end(response.body)
    }
  })

  server.listen(config.port, '127.0.0.1', () => {
    console.log(`Matters Onion Reader listening on http://127.0.0.1:${config.port}`)
  })
}
