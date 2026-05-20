# Security and Privacy

## Privacy Model

The gateway protects readers from direct browser-side exposure to the clearnet Matters web app and third-party page resources.

It does not make users anonymous to Matters after they log in. Matters still receives authenticated API requests from the gateway.

## Threats Reduced

- Local network observer seeing direct Matters web traffic
- Browser loading third-party scripts from article content
- Browser loading external images directly
- Readers exposing clearnet IPFS gateway requests from Tor Browser
- Casual traffic correlation from page subresources

## Threats Not Solved

- Matters account identity is still known to Matters after login
- AWS can observe server metadata
- Matters can observe gateway API traffic
- A compromised gateway can steal sessions
- Tor-level traffic correlation is outside scope

## Required Controls

### Session

- Short-lived session
- `HttpOnly` cookie
- `SameSite=Strict`
- No long-term token storage
- Logout clears session server-side and client-side where applicable

### Logging

Do not log:

- Passwords
- Access tokens
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

- Matters credentials
- Matters access token
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

- Login rate limit
- Short upstream timeouts
- Request body size limits
- Image proxy size limits
- IPFS gateway timeout

Avoid adding CAPTCHA in MVP because it can harm Tor usability.

## Content Boundary

Respect:

- archived articles
- banned articles
- non-public access type
- noindex flag
- upstream errors

The gateway should not turn unavailable or restricted content into public content.
