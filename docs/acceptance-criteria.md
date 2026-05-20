# Acceptance Criteria

## MVP Acceptance

The MVP is acceptable when the following criteria are met.

## Access

- The app is reachable through a `.onion` address
- The app does not require a clearnet domain to function
- Direct public HTTP access to the app port is not exposed
- `/healthz` returns a minimal status without secrets

## Login

- User can log in with a Matters account through the onion site
- User can log out
- Session expires automatically
- Session cookie is `HttpOnly`
- Session cookie uses `SameSite=Strict`
- Credentials are never logged
- Access token is never logged
- Access token is not stored in a long-lived database

## Article Reading

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

## Personal Pages

When Phase 2 is implemented:

- Logged-in user can view my articles
- Logged-in user can view my bookmarks
- Personal pages are not cached publicly
- Personal page errors do not expose upstream tokens

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
- No real token, password, onion private key, IP address, SSH host, or account identifier is committed
