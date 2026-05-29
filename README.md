# Matters 馬特市洋蔥小站

Matters 馬特市洋蔥小站 is a lightweight anonymous Tor onion reader for Matters.

It is designed to be simple, cheap, and sustainable. It does not mirror the full Matters site. It provides a minimal onion interface for public article reading and IPFS-aware content verification by using existing Matters GraphQL and IPFS support.

## Goals

- Provide an onion-friendly read-only path for Matters readers
- Provide anonymous discovery through public search, public channels, and a lightweight home feed
- Provide anonymous author lookup by Matters ID or display name
- Provide Traditional Chinese, Simplified Chinese, and English UI text
- Provide a single discovery field for article URLs, IPFS CIDs, author IDs, display names, and keywords
- Let users open articles by Matters URL, short hash, media hash, or IPFS CID
- Prefer existing Matters IPFS fingerprints when available
- Proxy or block external resources to reduce reader network leakage
- Keep infrastructure small enough to run on one low-cost AWS EC2 instance

## Non-goals

- No full-site mirror
- No independent full-text search engine
- No clone of matters-web
- No login in MVP
- No bookmarks or comments in MVP
- No publishing, editing, payment, notification, or wallet workflow in MVP
- No long-term storage of user credentials or access tokens
- No storage of private user content
- No promise of latest global content sync

## MVP

The first version should include only:

- Anonymous home page backed by public Matters channel data
- Anonymous public article search backed by Matters GraphQL
- Anonymous author search and author article lists backed by Matters GraphQL
- Public channel article lists
- A static hero illustration and a dedicated privacy explanation page
- Article lookup and sanitized reading page
- IPFS CID display and gateway adapter
- Image proxy or remote image blocking
- Basic health check
- Minimal deployment scripts and docs

## Architecture

```text
Tor Browser
  -> .onion address
  -> AWS EC2
     -> Tor daemon
     -> Node app
     -> optional local IPFS gateway
     -> Matters GraphQL API
```

Cloudflare is optional and should only support clearnet landing pages, DNS, status pages, and non-sensitive cache storage. It should not host the primary onion service.

## Repository Status

This repository now contains the first anonymous read-only Node app plus planning, deployment, and acceptance documents.

## Local Development

```bash
npm install
npm start
```

Open `http://127.0.0.1:3000`.

Useful local routes:

```text
GET /
GET /discover?q=matters
GET /why-onion
GET /search?q=matters
GET /author?q=Matty
GET /author/{userName}
GET /channel/{shortHash}
GET /tag/{tagId}
GET /article/{shortHash}
GET /healthz
```

Add `?lang=zh-Hans` to use the Simplified Chinese interface, or `?lang=en` to use English. The default interface is Traditional Chinese unless the browser sends a Simplified Chinese or English `Accept-Language` header.

## Design System Use

This repo follows the vendored-copy path recommended by `thematters/design-system` for static HTML services. It uses the current Matters brand direction without adding a frontend build pipeline:

- Brand purple `#7258FF` and brand green `#C3F432`
- Pill-shaped primary buttons
- Text field focus ring behavior
- Lightweight ArticleCard, AuthorCard, and Avatar patterns
- Static square hero visual direction based on Matters RSS and Matters Studio announcement graphics, currently using a soft cream and light green onion gateway scene with subtle purple and lime accents

React components are intentionally not imported because the onion gateway has no client-side React runtime.

Run tests:

```bash
npm test
```

## Documents

- [Architecture](docs/architecture.md)
- [Deployment Phases](docs/deployment-phases.md)
- [Acceptance Criteria](docs/acceptance-criteria.md)
- [Security and Privacy](docs/security-and-privacy.md)
- [Operations](docs/operations.md)
- [Clearnet Landing Page](docs/clearnet-landing.md)
- [GraphQL and IPFS Notes](docs/graphql-ipfs-notes.md)
- [Open Questions](docs/open-questions.md)

## Cost Principle

The default deployment target is one small EC2 instance. Avoid services, databases, queues, and caches until there is a concrete need.

## Sustainability Principle

The gateway should remain understandable by one maintainer. Each new feature must justify its operational cost, privacy risk, and user value.
