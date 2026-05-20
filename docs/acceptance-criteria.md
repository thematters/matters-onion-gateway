# Acceptance Criteria

## MVP Acceptance

The MVP is acceptable when the following criteria are met.

## Access

- The app is reachable through a `.onion` address
- The app does not require a clearnet domain to function
- Direct public HTTP access to the app port is not exposed
- `/healthz` returns a minimal status without secrets

## Anonymous Scope

- No login form exists
- No session cookie is issued
- No Matters access token is required
- No mutation is sent to Matters GraphQL
- Search requests use Matters GraphQL with `record: false`
- No credentials are requested or stored
- Language selection is carried by URL or request headers, not cookies

## Article Reading

- Home page lists public articles without requiring a known Matters URL
- Home page has one discovery field for articles, authors, keywords, and IPFS CIDs
- Home page links to a dedicated page explaining why an onion entrance helps privacy and safety
- User can search public articles without logging in
- User can search authors by ID or display name without logging in
- Author page displays public profile text and public article list when available
- User can browse public channel article lists without logging in
- User can open an article by Matters URL
- User can open an article by short hash
- Article page displays title, author, summary, timestamps, license, and IPFS identifiers when available
- Article HTML is sanitized before render
- Script tags are removed
- Inline event handlers are removed
- Unknown embeds are removed
- External links are clearly marked or routed through a warning page

## IPFS

- Article page displays `dataHash` or `mediaHash` when returned by Matters GraphQL
- `/ipfs/{cid}` can attempt to fetch CID content
- IPFS failure shows a clear error without leaking internal details
- GraphQL content fallback works when IPFS is unavailable

## Privacy

- Browser page does not load third-party JavaScript
- Browser page does not directly load clearnet images by default
- Hero image is served as a local static asset
- Image proxy does not log full source URLs
- Access logs are disabled or anonymized
- GraphQL request bodies are not logged
- Reading history is not stored

## Security Headers

Required headers:

```text
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; frame-src 'none'; connect-src 'self'; form-action 'self'; base-uri 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Deployment

- App runs under systemd
- Tor service survives reboot
- App restarts on failure
- Secrets are supplied through environment variables or systemd environment files
- Example config files use placeholders only

## Documentation

- README explains scope and non-goals
- Deployment phases are documented
- Acceptance criteria are documented
- Security and privacy boundaries are documented
- Traditional Chinese, Simplified Chinese, and English UI availability is documented
- No real token, password, onion private key, IP address, SSH host, or account identifier is committed
