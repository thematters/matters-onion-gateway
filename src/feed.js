import { escapeHtml } from './escape.js'

function rfc822(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toUTCString()
}

// Build an RSS 2.0 document from the home feed. `articleUrl` maps an article to
// an absolute link (onion path when the onion hostname is known, otherwise the
// canonical Matters URL). Pure and synchronous so it is easy to test.
export function buildRssFeed({
  title,
  description,
  homeUrl,
  selfUrl = '',
  articleUrl,
  articles = [],
}) {
  const items = articles
    .map((article) => {
      const link = articleUrl(article)
      const date = rfc822(article.createdAt)
      return [
        '    <item>',
        `      <title>${escapeHtml(article.title || '')}</title>`,
        `      <link>${escapeHtml(link)}</link>`,
        `      <guid isPermaLink="false">${escapeHtml(article.shortHash || article.id || link)}</guid>`,
        date ? `      <pubDate>${date}</pubDate>` : '',
        article.summary ? `      <description>${escapeHtml(article.summary)}</description>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const selfLink = selfUrl
    ? `    <atom:link href="${escapeHtml(selfUrl)}" rel="self" type="application/rss+xml" />\n`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(title)}</title>
    <link>${escapeHtml(homeUrl)}</link>
    <description>${escapeHtml(description)}</description>
${selfLink}${items}
  </channel>
</rss>
`
}
