# Deployment Phases

## Phase 0 Scope Lock

Target time: 0.5 to 1 day

Work:

- Confirm anonymous article query
- Confirm article fields for `dataHash`, `mediaHash`, `contents.html`, `contents.markdown`, `access.type`, and `noindex`
- Pick fallback IPFS gateway
- Decide whether MVP starts with local Kubo or gateway-only mode

Exit criteria:

- Query samples are saved in docs
- MVP field list is confirmed
- No secret or token is committed

## Phase 1 Onion Reader MVP

Target time: 3 to 7 days

Work:

- Create Node app skeleton
- Add GraphQL client
- Add anonymous home feed from public channels
- Add anonymous search with `record: false`
- Add public channel article lists
- Add article URL parser
- Add article lookup page
- Add sanitized article page
- Add IPFS CID display
- Add `/ipfs/{cid}` adapter
- Add CSP and security headers
- Add systemd service example
- Add Tor service example

Exit criteria:

- User can open the site through Tor Browser
- User can discover public articles from the onion home page without logging in
- User can search public articles without logging in
- User can paste a Matters URL and read the article
- Page does not load third-party JavaScript
- Remote images are proxied or blocked
- No login, token, or session code is required

## Phase 2 Reader Hardening

Target time: 1 to 2 weeks

Work:

- Add local Kubo gateway, if needed
- Add image proxy cache
- Add basic health checks
- Add Cloudflare clearnet landing page
- Add optional author page only if it stays anonymous and read-only

Exit criteria:

- IPFS adapter is local-first if Kubo is enabled
- Health check reports app and upstream status
- Clearnet landing page publishes the onion address without requiring user accounts

## Phase 3 Optional Read-only Expansion

Target time: demand-driven

Possible work:

- Read-only comments
- Article version history
- Author page
- Tag page
- Public R2 cache for non-sensitive static assets

Exit criteria:

- Each added page has a privacy review
- Each added page has acceptance criteria
- No feature adds long-term user activity storage
- No feature requires user login

## Deferred Features

These should not be implemented in the first release:

- Publishing
- Editing
- Payment
- Donation
- Wallet
- Notifications
- Login
- Bookmarks
- Comments mutation
- Full-site crawler
- Independent full-text search index
- Global article sync
