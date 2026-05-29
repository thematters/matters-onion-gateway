export const config = {
  port: Number(process.env.PORT || 3000),
  mattersGraphqlEndpoint:
    process.env.MATTERS_GRAPHQL_ENDPOINT ||
    'https://server.matters.news/graphql',
  ipfsLocalGateway: process.env.IPFS_LOCAL_GATEWAY || '',
  ipfsFallbackGateway: process.env.IPFS_FALLBACK_GATEWAY || 'https://ipfs.io',
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 8000),
  imageProxyMaxBytes: Number(process.env.IMAGE_PROXY_MAX_BYTES || 5_242_880),
  feedCacheTtlMs: Number(process.env.FEED_CACHE_TTL_MS || 45_000),
  maxUpstreamConcurrency: Number(process.env.MAX_UPSTREAM_CONCURRENCY || 6),
}
