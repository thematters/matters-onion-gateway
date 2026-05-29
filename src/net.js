import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

// Hosts that are allowed as upstream image sources. The gateway only proxies
// images served by Matters asset hosts plus any configured IPFS gateway. This
// is the primary defense against SSRF: even with DNS rebinding an attacker
// would have to control DNS for one of these hostnames, which they do not.
export function isAllowedHost(hostname, allowedHosts) {
  if (!hostname) {
    return false
  }

  const normalized = hostname.toLowerCase()
  return allowedHosts.some((allowed) => {
    const candidate = allowed.toLowerCase()
    return normalized === candidate || normalized.endsWith(`.${candidate}`)
  })
}

// Only default and standard web ports are accepted. This blocks tricks like
// `assets.matters.news:22` from reaching non-HTTP services.
export function isAllowedPort(port) {
  return port === '' || port === '80' || port === '443'
}

// Defense in depth on top of the host allowlist: reject any address that points
// at loopback, private, link-local, CGNAT, or other non-public ranges so the
// proxy can never be steered at internal infrastructure (e.g. cloud metadata).
export function isPublicAddress(address) {
  const family = isIP(address)

  if (family === 4) {
    return isPublicIpv4(address)
  }

  if (family === 6) {
    return isPublicIpv6(address)
  }

  return false
}

function isPublicIpv4(address) {
  const octets = address.split('.').map((part) => Number(part))
  if (octets.length !== 4 || octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false
  }

  const [a, b] = octets

  if (a === 0) return false // 0.0.0.0/8 "this network"
  if (a === 10) return false // private
  if (a === 127) return false // loopback
  if (a === 169 && b === 254) return false // link-local (incl. cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return false // private
  if (a === 192 && b === 168) return false // private
  if (a === 100 && b >= 64 && b <= 127) return false // CGNAT 100.64/10
  if (a === 192 && b === 0 && octets[2] === 0) return false // 192.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return false // benchmarking 198.18/15
  if (a >= 224) return false // multicast + reserved + 255.255.255.255

  return true
}

function isPublicIpv6(address) {
  const lower = address.toLowerCase()

  if (lower === '::' || lower === '::1') return false // unspecified, loopback

  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible addresses delegate to v4.
  const mapped = lower.match(/::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) {
    return isPublicIpv4(mapped[1])
  }

  const head = lower.split(':')[0]
  const block = parseInt(head || '0', 16)

  if ((block & 0xfe00) === 0xfc00) return false // unique local fc00::/7
  if ((block & 0xffc0) === 0xfe80) return false // link-local fe80::/10

  return true
}

// Resolve a hostname and confirm every resolved address is public. Throws if any
// address is private or the host does not resolve.
export async function assertPublicHost(hostname) {
  const records = await lookup(hostname, { all: true, verbatim: true })
  if (!records.length) {
    throw new Error('Host did not resolve')
  }

  for (const record of records) {
    if (!isPublicAddress(record.address)) {
      throw new Error('Host resolves to a non-public address')
    }
  }
}
