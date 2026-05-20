import { escapeAttr, escapeHtml } from './escape.js'

export function layout({ title, body, status = 200 }) {
  return {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="page">
    ${body}
  </main>
</body>
</html>`,
  }
}

export function homeView({
  value = '',
  error = '',
  searchError = '',
  channels = [],
  articles = [],
} = {}) {
  return layout({
    title: 'Matters Onion Reader',
    body: `<section class="hero">
  <p class="eyebrow">Anonymous read-only gateway</p>
  <h1>Matters Onion Reader</h1>
  <p class="lead">Read public Matters articles through a minimal onion-friendly reader. No login, no tracking scripts, no full-site mirror.</p>
  <form class="lookup" action="/search" method="get">
    <label for="search-q">Search public articles</label>
    <div class="lookup-row">
      <input id="search-q" name="q" placeholder="Keyword, title, author, or topic" autocomplete="off" autofocus>
      <button type="submit">Search</button>
    </div>
  </form>
  ${searchError ? `<p class="error">${escapeHtml(searchError)}</p>` : ''}
  <form class="lookup" action="/article" method="get">
    <label for="q">Article URL, short hash, media hash, or IPFS CID</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(value)}" placeholder="https://matters.town/a/..." autocomplete="off">
      <button type="submit">Open</button>
    </div>
  </form>
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
</section>

${articles.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Recent public articles</p>
    <h2>Channel-derived latest</h2>
  </div>
  <div class="article-list">${articles.map(articleCard).join('')}</div>
</section>` : ''}

${channels.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Public channels</p>
    <h2>Browse by channel</h2>
  </div>
  <div class="channel-list">${channels.map(channelLink).join('')}</div>
</section>` : ''}`,
  })
}

export function articleView({ article, html, sourceInput }) {
  const author = article.author || {}
  const tags = Array.isArray(article.tags)
    ? article.tags.map((tag) => tag?.content).filter(Boolean)
    : []
  const cid = article.dataHash || article.mediaHash || ''
  const canonicalUrl = article.shortHash
    ? `https://matters.town/a/${article.shortHash}`
    : ''

  return layout({
    title: article.title || 'Article',
    body: `<article class="article">
  <nav class="topnav"><a href="/">New lookup</a></nav>
  <header class="article-header">
    <p class="eyebrow">Matters public article</p>
    <h1>${escapeHtml(article.title || 'Untitled')}</h1>
    <p class="meta">By ${escapeHtml(author.displayName || author.userName || 'Unknown author')}${author.userName ? ` (@${escapeHtml(author.userName)})` : ''}</p>
    <p class="meta">${formatDate(article.createdAt)}${article.revisedAt ? ` · revised ${formatDate(article.revisedAt)}` : ''}</p>
    ${article.summary ? `<p class="summary">${escapeHtml(article.summary)}</p>` : ''}
  </header>

  <section class="facts">
    <div><span>State</span><strong>${escapeHtml(article.state || 'unknown')}</strong></div>
    <div><span>Access</span><strong>${escapeHtml(article.access?.type || 'unknown')}</strong></div>
    <div><span>License</span><strong>${escapeHtml(article.license || 'unknown')}</strong></div>
    <div><span>Noindex</span><strong>${article.noindex ? 'yes' : 'no'}</strong></div>
  </section>

  <section class="hashes">
    <h2>Content identifiers</h2>
    ${hashRow('shortHash', article.shortHash)}
    ${hashRow('dataHash', article.dataHash)}
    ${hashRow('mediaHash', article.mediaHash)}
    ${cid ? `<p><a class="button-link" href="/ipfs/${encodeURIComponent(cid)}">Open IPFS CID through gateway</a></p>` : '<p class="muted">No IPFS CID was returned by the API.</p>'}
  </section>

  ${tags.length ? `<section class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</section>` : ''}

  <section class="content">
    ${html}
  </section>

  <footer class="article-footer">
    ${canonicalUrl ? `<p>Canonical source: <a href="${escapeAttr(canonicalUrl)}" rel="noreferrer noopener" target="_blank">${escapeHtml(canonicalUrl)}</a></p>` : ''}
    <p>Lookup input: ${escapeHtml(sourceInput)}</p>
  </footer>
</article>`,
  })
}

export function searchView({ query, result }) {
  const count = result.totalCount || result.articles.length

  return layout({
    title: `Search ${query}`,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="/">Home</a></nav>
  <p class="eyebrow">Search public articles</p>
  <h1>${escapeHtml(query)}</h1>
  <p class="lead">${count} matching public results reported by Matters search. Showing the first ${result.articles.length} readable articles.</p>
  <form class="lookup" action="/search" method="get">
    <label for="q">Search again</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(query)}" autocomplete="off">
      <button type="submit">Search</button>
    </div>
  </form>
</section>
<section class="section">
  ${result.articles.length ? `<div class="article-list">${result.articles.map(articleCard).join('')}</div>` : '<p class="muted">No readable public articles were returned.</p>'}
</section>`,
  })
}

export function channelView({ channel }) {
  return layout({
    title: channel.title || 'Channel',
    body: `<section class="hero compact">
  <nav class="topnav"><a href="/">Home</a></nav>
  <p class="eyebrow">Public channel</p>
  <h1>${escapeHtml(channel.title || 'Untitled channel')}</h1>
  <p class="lead">Anonymous read-only list from Matters channel data.</p>
</section>
<section class="section">
  ${channel.articles.length ? `<div class="article-list">${channel.articles.map(articleCard).join('')}</div>` : '<p class="muted">No readable public articles were returned.</p>'}
</section>`,
  })
}

export function errorView(message, status = 400) {
  return layout({
    title: 'Request failed',
    status,
    body: `<section class="hero">
  <p class="eyebrow">Request failed</p>
  <h1>${escapeHtml(message)}</h1>
  <p><a href="/">Return to lookup</a></p>
</section>`,
  })
}

function articleCard(article) {
  const author = article.author || {}
  const authorName = author.displayName || author.userName || 'Unknown author'
  const href = article.shortHash ? `/article/${encodeURIComponent(article.shortHash)}` : '#'
  const channel = article.channel?.title
    ? `<span>${escapeHtml(article.channel.title)}</span>`
    : ''

  return `<article class="article-card">
  <h3><a href="${escapeAttr(href)}">${escapeHtml(article.title || 'Untitled')}</a></h3>
  <p class="meta">By ${escapeHtml(authorName)}${author.userName ? ` (@${escapeHtml(author.userName)})` : ''}</p>
  <p class="meta">${formatDate(article.createdAt)}${channel}</p>
  ${article.summary ? `<p>${escapeHtml(trimSummary(article.summary))}</p>` : ''}
</article>`
}

function channelLink(channel) {
  return `<a class="channel-link" href="/channel/${encodeURIComponent(channel.shortHash)}">
  <span>${escapeHtml(channel.title || 'Untitled channel')}</span>
  <small>${channel.articles.length} sampled articles</small>
</a>`
}

function hashRow(label, value) {
  if (!value) {
    return `<p class="hash-row"><span>${escapeHtml(label)}</span><code>not available</code></p>`
  }

  return `<p class="hash-row"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></p>`
}

function trimSummary(value) {
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > 220 ? `${text.slice(0, 217)}...` : text
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value)
  }

  return escapeHtml(date.toISOString().slice(0, 10))
}
