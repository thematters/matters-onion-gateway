# GraphQL and IPFS Notes

## Known Public Sources

Matters exposes GraphQL through the Matters server endpoint. The gateway should centralize all operations and keep them small.

Article fields expected for MVP:

```graphql
query ArticleByShortHash($shortHash: String) {
  article(input: { shortHash: $shortHash }) {
    id
    title
    slug
    shortHash
    dataHash
    mediaHash
    state
    summary
    createdAt
    revisedAt
    language
    license
    noindex
    author {
      id
      userName
      displayName
    }
    tags {
      id
      content
    }
    access {
      type
    }
    contents {
      html
      markdown
    }
  }
}
```

## Identifier Parsing

Support input forms:

```text
https://matters.town/a/{shortHash}
https://matters.news/a/{shortHash}
/a/{shortHash}
{shortHash}
{mediaHash}
{ipfsCid}
```

Legacy Matters URLs can be added later.

## IPFS Policy

MVP behavior:

- Show `dataHash` and `mediaHash` if available
- Do not pin all articles
- Do not crawl all Matters content
- Offer `/ipfs/{cid}` gateway adapter
- Use GraphQL content as fallback

## Gateway Order

Recommended order:

```text
local Kubo gateway
fallback gateway
error page
```

Each gateway request must use:

- Short timeout
- Size limit
- Content type allowlist where possible

## Handling Empty IPFS Fields

Some articles may return empty `dataHash` or `mediaHash`.

Fallback:

- Render sanitized `contents.html`
- Display that no IPFS CID was available from the API
- Do not fabricate a CID

## Respect Content State

The gateway should refuse or downgrade rendering when:

- `state` is not active
- `access.type` is not public and the user lacks access
- `noindex` is true and policy decides not to republish

For MVP, if in doubt, show less content.
