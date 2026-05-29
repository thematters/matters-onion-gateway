# Security and Privacy

## Privacy Model

The gateway protects readers from direct browser-side exposure to the clearnet Matters web app and third-party page resources.

The MVP is anonymous and read-only. It does not ask for Matters credentials and does not send authenticated GraphQL requests.

## Threats Reduced

- Local network observer seeing direct Matters web traffic
- Browser loading third-party scripts from article content
- Browser loading external images directly
- Readers exposing clearnet IPFS gateway requests from Tor Browser
- Casual traffic correlation from page subresources

## Threats Not Solved

- AWS can observe server metadata
- Matters can observe gateway API traffic
- A compromised gateway can observe reader requests through the gateway
- Tor-level traffic correlation is outside scope

## Required Controls

### Anonymous Operation

- No login form
- No session storage
- No access token storage
- No GraphQL mutations in MVP

### Logging

Do not log:

- GraphQL request bodies
- Full query strings
- Full image proxy URLs
- Reading history

Allowed logs:

- Timestamp
- Route pattern
- Status code
- Short error class
- Latency bucket

### HTML Sanitization

Remove:

- `script`
- `iframe`
- inline event handlers
- unknown embeds
- external styles
- tracking pixels when detectable

Rewrite:

- Images to local proxy path
- External links to warning path or clearly marked links

### CSP

Use a strict default CSP:

```text
default-src 'self';
img-src 'self' data:;
style-src 'self';
script-src 'none';
frame-src 'none';
connect-src 'self';
form-action 'self';
base-uri 'none';
```

## Secret Handling

Never commit:

- Session secret
- AWS credentials
- Cloudflare token
- Onion private key
- SSH private key
- Real server IP address

Use:

- `.env.example` with placeholders
- systemd environment file outside repo
- AWS IAM role where possible

## Abuse Controls

MVP should include:

- Short upstream timeouts
- Request body size limits
- Image proxy size limits
- IPFS gateway timeout

Avoid adding CAPTCHA in MVP because it can harm Tor usability.

## Image Proxy SSRF Controls

The image proxy must never become a way to reach internal infrastructure. It enforces:

- A host allowlist. By default only `assets.matters.news` and `imagedelivery.net`
  are accepted, plus the configured IPFS gateway hosts. Operators can override the
  list with `IMAGE_PROXY_ALLOWED_HOSTS`.
- Standard web ports only (default, `80`, or `443`).
- A public-address check: the host is resolved and rejected if any resolved
  address is loopback, private, link-local (including the cloud metadata range),
  CGNAT, or otherwise non-public.
- `redirect: 'error'` so an allowed host cannot redirect the fetch elsewhere.
- A streaming byte cap. The body is read incrementally and aborted once
  `IMAGE_PROXY_MAX_BYTES` is exceeded; the `content-length` header is not trusted.

Residual risk: a fast DNS-rebinding attacker controlling DNS for an allowlisted
host could still pass the resolve check. The host allowlist is the primary control
because the attacker would have to control DNS for a Matters-owned hostname.

## Content Boundary

Respect:

- archived articles
- banned articles
- non-public access type
- noindex flag
- upstream errors

The gateway should not turn unavailable or restricted content into public content.

### noindex Handling

noindex articles are hidden entirely. They are filtered out of every discovery
surface (home, channels, author lists, search) and a direct lookup by hash returns
the same not-found response as a missing article, so the gateway never reveals that
a noindex article exists.
