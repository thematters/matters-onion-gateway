export const config = {
  port: Number(process.env.PORT || 3000),
  mattersGraphqlEndpoint:
    process.env.MATTERS_GRAPHQL_ENDPOINT ||
    'https://server.matters.news/graphql',
  ipfsLocalGateway: process.env.IPFS_LOCAL_GATEWAY || '',
  ipfsFallbackGateway: process.env.IPFS_FALLBACK_GATEWAY || 'https://ipfs.io',
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 8000),
  imageProxyMaxBytes: Number(process.env.IMAGE_PROXY_MAX_BYTES || 5_242_880),
  // The service's own .onion hostname (e.g. abc...xyz.onion). When set and a
  // request arrives over clearnet, the app advertises the onion via Onion-Location.
  onionHostname: (process.env.ONION_HOSTNAME || '').trim().toLowerCase(),
}
