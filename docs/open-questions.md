# Open Questions

## Product

- Should the first public release allow login, or start as anonymous article reader only?
- Should my bookmarks be included in MVP or Phase 2?
- Should external links open directly, or always pass through a warning page?
- Should noindex articles be hidden entirely or shown only to authenticated users with access?

## Technical

- Which exact Matters login mutation should be used for production?
- Should session storage be encrypted cookie only, or server-side session?
- Should local Kubo be included from day one?
- Which fallback IPFS gateway is acceptable?
- What timeout should be used for GraphQL and IPFS requests?

## Operations

- Should the GitHub repo be public immediately?
- Should the clearnet landing page live on Cloudflare Pages or Workers?
- Who controls the onion private key backup?
- What is the maintenance budget per month?

## Legal and Trust

- What wording should explain that logged-in users are still known to Matters?
- What takedown or issue-reporting process should be provided?
- Should the gateway publish source code before public launch?
