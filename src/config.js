const DEFAULT_IMAGE_HOSTS = ['assets.matters.news', 'imagedelivery.net']

const ipfsLocalGateway = process.env.IPFS_LOCAL_GATEWAY || ''
const ipfsFallbackGateway = process.env.IPFS_FALLBACK_GATEWAY || 'https://ipfs.io'

function hostnameOf(value) {
  try {
    return new URL(value).hostname
  } catch {
    return ''
  }
}

function parseAllowedImageHosts() {
  const fromEnv = (process.env.IMAGE_PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

  const base = fromEnv.length ? fromEnv : DEFAULT_IMAGE_HOSTS

  // Images can also be served from the configured IPFS gateways, so allow them
  // implicitly without forcing the operator to repeat the host.
  const ipfsHosts = [ipfsLocalGateway, ipfsFallbackGateway]
    .map(hostnameOf)
    .filter(Boolean)

  return Array.from(new Set([...base, ...ipfsHosts]))
}

export const config = {
  port: Number(process.env.PORT || 3000),
  mattersGraphqlEndpoint:
    process.env.MATTERS_GRAPHQL_ENDPOINT ||
    'https://server.matters.news/graphql',
  ipfsLocalGateway,
  ipfsFallbackGateway,
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 8000),
  imageProxyMaxBytes: Number(process.env.IMAGE_PROXY_MAX_BYTES || 5_242_880),
  imageProxyAllowedHosts: parseAllowedImageHosts(),
  feedCacheTtlMs: Number(process.env.FEED_CACHE_TTL_MS || 45_000),
  maxUpstreamConcurrency: Number(process.env.MAX_UPSTREAM_CONCURRENCY || 6),
}
