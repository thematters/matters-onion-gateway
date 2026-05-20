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

export function homeView({ value = '', error = '' } = {}) {
  return layout({
    title: 'Matters Onion Reader',
    body: `<section class="hero">
  <p class="eyebrow">Anonymous read-only gateway</p>
  <h1>Matters Onion Reader</h1>
  <p class="lead">Open a public Matters article through a minimal onion-friendly reader. No login, no tracking scripts, no full-site mirror.</p>
  <form class="lookup" action="/article" method="get">
    <label for="q">Article URL, short hash, media hash, or IPFS CID</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(value)}" placeholder="https://matters.town/a/..." autocomplete="off" autofocus>
      <button type="submit">Open</button>
    </div>
  </form>
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
</section>`,
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

function hashRow(label, value) {
  if (!value) {
    return `<p class="hash-row"><span>${escapeHtml(label)}</span><code>not available</code></p>`
  }

  return `<p class="hash-row"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></p>`
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
