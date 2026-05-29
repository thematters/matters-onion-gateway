# Open Questions

## Resolved Decisions

- noindex articles are hidden entirely (not shown with a label). Implemented:
  filtered from all discovery surfaces and direct-lookup returns not-found.
- Takedown and issue-reporting follow IPFS norms (content addressing means the
  gateway de-lists and stops serving, rather than promising deletion of CIDs).
- The repository will be open-sourced, but only after the security-sensitive parts
  are hardened first.
- The onion private key backup is held by the maintainer (mashbean) personally.

## Product

- Should external links open directly, or always pass through a warning page?

## Technical

- Should local Kubo be included from day one?
- Which fallback IPFS gateway is acceptable?
- What timeout should be used for GraphQL and IPFS requests?

## Operations

- Should the GitHub repo be public immediately?
- Should the clearnet landing page live on Cloudflare Pages or Workers?
- Who controls the onion private key backup?
- What is the maintenance budget per month?

## Legal and Trust

- What wording should explain that the MVP is anonymous and read-only?
- What takedown or issue-reporting process should be provided?
- Should the gateway publish source code before public launch?
