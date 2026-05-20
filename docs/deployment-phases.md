# Deployment Phases

## Phase 0 Scope Lock

Target time: 0.5 to 1 day

Work:

- Confirm Matters GraphQL login operation
- Confirm anonymous article query
- Confirm logged-in viewer query
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
- Add login and logout
- Add short-lived session
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
- User can log in through the onion site
- User can paste a Matters URL and read the article
- Page does not load third-party JavaScript
- Remote images are proxied or blocked
- Access tokens are not written to logs or disk

## Phase 2 Personal Reader

Target time: 1 to 2 weeks

Work:

- Add my articles
- Add my bookmarks
- Add local Kubo gateway, if needed
- Add image proxy cache
- Add login rate limit
- Add basic health checks
- Add Cloudflare clearnet landing page

Exit criteria:

- Logged-in user can read personal article lists
- IPFS adapter is local-first if Kubo is enabled
- Health check reports app and upstream status
- Clearnet landing page publishes the onion address without requiring login

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

## Deferred Features

These should not be implemented in the first release:

- Publishing
- Editing
- Payment
- Donation
- Wallet
- Notifications
- Full-site crawler
- Full-text search
- Global article sync
