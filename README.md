# Matters Onion Gateway

Matters Onion Gateway is a lightweight anonymous Tor onion reader for Matters.

It is designed to be simple, cheap, and sustainable. It does not mirror the full Matters site. It provides a minimal onion interface for public article reading and IPFS-aware content verification by using existing Matters GraphQL and IPFS support.

## Goals

- Provide an onion-friendly read-only path for Matters readers
- Let users open articles by Matters URL, short hash, media hash, or IPFS CID
- Prefer existing Matters IPFS fingerprints when available
- Proxy or block external resources to reduce reader network leakage
- Keep infrastructure small enough to run on one low-cost AWS EC2 instance

## Non-goals

- No full-site mirror
- No full-text search engine
- No clone of matters-web
- No login in MVP
- No bookmarks or comments in MVP
- No publishing, editing, payment, notification, or wallet workflow in MVP
- No long-term storage of user credentials or access tokens
- No storage of private user content
- No promise of latest global content sync

## MVP

The first version should include only:

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
- [GraphQL and IPFS Notes](docs/graphql-ipfs-notes.md)
- [Open Questions](docs/open-questions.md)

## Cost Principle

The default deployment target is one small EC2 instance. Avoid services, databases, queues, and caches until there is a concrete need.

## Sustainability Principle

The gateway should remain understandable by one maintainer. Each new feature must justify its operational cost, privacy risk, and user value.
