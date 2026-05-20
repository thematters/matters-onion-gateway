import { config } from './config.js'

const normalizeGateway = (gateway) => gateway.replace(/\/+$/, '')

export function buildIpfsGatewayUrls(cid) {
  const urls = []

  if (config.ipfsLocalGateway) {
    urls.push(`${normalizeGateway(config.ipfsLocalGateway)}/ipfs/${cid}`)
  }

  if (config.ipfsFallbackGateway) {
    urls.push(`${normalizeGateway(config.ipfsFallbackGateway)}/ipfs/${cid}`)
  }

  return urls
}

export async function fetchIpfsCid(cid) {
  const errors = []

  for (const url of buildIpfsGatewayUrls(cid)) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), config.upstreamTimeoutMs)

    try {
      const response = await fetch(url, {
        headers: { accept: 'text/html, text/plain, application/json, */*' },
        signal: controller.signal,
      })

      if (response.ok) {
        return response
      }

      errors.push(`${url} returned ${response.status}`)
    } catch (error) {
      errors.push(`${url} failed: ${error.name}`)
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new Error(errors.join('; ') || 'No IPFS gateway configured')
}
