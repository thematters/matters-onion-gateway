import { escapeAttr, escapeHtml } from './escape.js'
import { getMessages, isSimplified, languages } from './i18n.js'

export function layout({ title, body, status = 200, lang = languages.traditional }) {
  return {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: `<!doctype html>
<html lang="${escapeAttr(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="page">
    ${languageNav(lang)}
    ${body}
  </main>
</body>
</html>`,
  }
}

export function homeView({
  value = '',
  error = '',
  errorKey = '',
  searchErrorKey = '',
  authorErrorKey = '',
  channels = [],
  articles = [],
  lang = languages.traditional,
} = {}) {
  const t = getMessages(lang)

  return layout({
    title: 'Matters Onion Reader',
    lang,
    body: `<section class="hero">
  <p class="eyebrow">${escapeHtml(t.anonymousGateway)}</p>
  <h1>Matters Onion Reader</h1>
  <p class="lead">${escapeHtml(t.intro)}</p>
  <form class="lookup" action="/search" method="get">
    ${langField(lang)}
    <label for="search-q">${escapeHtml(t.searchArticles)}</label>
    <div class="lookup-row">
      <input id="search-q" name="q" placeholder="${escapeAttr(t.searchPlaceholder)}" autocomplete="off" autofocus>
      <button type="submit">${escapeHtml(t.search)}</button>
    </div>
  </form>
  ${searchErrorKey ? `<p class="error">${escapeHtml(t[searchErrorKey])}</p>` : ''}
  <form class="lookup" action="/author" method="get">
    ${langField(lang)}
    <label for="author-q">${escapeHtml(t.searchAuthors)}</label>
    <div class="lookup-row">
      <input id="author-q" name="q" placeholder="${escapeAttr(t.searchAuthorsPlaceholder)}" autocomplete="off">
      <button type="submit">${escapeHtml(t.search)}</button>
    </div>
  </form>
  ${authorErrorKey ? `<p class="error">${escapeHtml(t[authorErrorKey])}</p>` : ''}
  <form class="lookup" action="/article" method="get">
    ${langField(lang)}
    <label for="q">${escapeHtml(t.articleLookup)}</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(value)}" placeholder="https://matters.town/a/..." autocomplete="off">
      <button type="submit">${escapeHtml(t.open)}</button>
    </div>
  </form>
  ${errorKey ? `<p class="error">${escapeHtml(t[errorKey])}</p>` : ''}
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
</section>

${articles.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.latestPublicArticles)}</p>
    <h2>${escapeHtml(t.channelDerivedLatest)}</h2>
  </div>
  <div class="article-list">${articles.map((article) => articleCard(article, lang)).join('')}</div>
</section>` : ''}

${channels.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.publicChannels)}</p>
    <h2>${escapeHtml(t.browseByChannel)}</h2>
  </div>
  <div class="channel-list">${channels.map((channel) => channelLink(channel, lang)).join('')}</div>
</section>` : ''}`,
  })
}

export function articleView({ article, html, sourceInput, lang = languages.traditional }) {
  const t = getMessages(lang)
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
    lang,
    body: `<article class="article">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <header class="article-header">
    <p class="eyebrow">${escapeHtml(t.publicArticle)}</p>
    <h1>${escapeHtml(article.title || 'Untitled')}</h1>
    <p class="meta">By ${escapeHtml(author.displayName || author.userName || t.sourceUnknown)}${author.userName ? ` (@${escapeHtml(author.userName)})` : ''}</p>
    <p class="meta">${formatDate(article.createdAt)}${article.revisedAt ? ` · revised ${formatDate(article.revisedAt)}` : ''}</p>
    ${article.summary ? `<p class="summary">${escapeHtml(article.summary)}</p>` : ''}
  </header>

  <section class="facts">
    <div><span>${escapeHtml(t.state)}</span><strong>${escapeHtml(article.state || 'unknown')}</strong></div>
    <div><span>Access</span><strong>${escapeHtml(article.access?.type || 'unknown')}</strong></div>
    <div><span>${escapeHtml(t.license)}</span><strong>${escapeHtml(article.license || 'unknown')}</strong></div>
    <div><span>${escapeHtml(t.noindex)}</span><strong>${article.noindex ? 'yes' : 'no'}</strong></div>
  </section>

  <section class="hashes">
    <h2>${escapeHtml(t.contentIdentifiers)}</h2>
    ${hashRow('shortHash', article.shortHash)}
    ${hashRow('dataHash', article.dataHash)}
    ${hashRow('mediaHash', article.mediaHash)}
    ${cid ? `<p><a class="button-link" href="${href(`/ipfs/${encodeURIComponent(cid)}`, lang)}">${escapeHtml(t.openIpfs)}</a></p>` : `<p class="muted">${escapeHtml(t.noIpfsCid)}</p>`}
  </section>

  ${tags.length ? `<section class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</section>` : ''}

  <section class="content">
    ${html}
  </section>

  <footer class="article-footer">
    ${canonicalUrl ? `<p>${escapeHtml(t.canonicalSource)}: <a href="${escapeAttr(canonicalUrl)}" rel="noreferrer noopener" target="_blank">${escapeHtml(canonicalUrl)}</a></p>` : ''}
    <p>${escapeHtml(t.lookupInput)}: ${escapeHtml(sourceInput)}</p>
  </footer>
</article>`,
  })
}

export function searchView({
  query,
  result,
  authorResult,
  author,
  mode = 'articles',
  lang = languages.traditional,
}) {
  if (mode === 'authors') {
    return authorSearchView({ query, result: authorResult, lang })
  }

  if (mode === 'author') {
    return authorView({ author, lang })
  }

  const t = getMessages(lang)
  const count = result.totalCount || result.articles.length

  return layout({
    title: `${t.search} ${query}`,
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <p class="eyebrow">${escapeHtml(t.searchArticles)}</p>
  <h1>${escapeHtml(query)}</h1>
  <p class="lead">${escapeHtml(t.summarySearch(count, result.articles.length))}</p>
  <form class="lookup" action="/search" method="get">
    ${langField(lang)}
    <label for="q">${escapeHtml(t.searchAgain)}</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(query)}" autocomplete="off">
      <button type="submit">${escapeHtml(t.search)}</button>
    </div>
  </form>
</section>
<section class="section">
  ${result.articles.length ? `<div class="article-list">${result.articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
</section>`,
  })
}

export function channelView({ channel, lang = languages.traditional }) {
  const t = getMessages(lang)

  return layout({
    title: channel.title || 'Channel',
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <p class="eyebrow">${escapeHtml(t.publicChannel)}</p>
  <h1>${escapeHtml(channel.title || 'Untitled channel')}</h1>
  <p class="lead">${escapeHtml(t.readPublicArticles)}</p>
</section>
<section class="section">
  ${channel.articles.length ? `<div class="article-list">${channel.articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
</section>`,
  })
}

export function errorView({
  message = '',
  messageKey = '',
  status = 400,
  lang = languages.traditional,
}) {
  const t = getMessages(lang)
  const text = message || t[messageKey] || messageKey

  return layout({
    title: t.requestFailed,
    status,
    lang,
    body: `<section class="hero">
  <p class="eyebrow">${escapeHtml(t.requestFailed)}</p>
  <h1>${escapeHtml(text)}</h1>
  <p><a href="${href('/', lang)}">${escapeHtml(t.returnToLookup)}</a></p>
</section>`,
  })
}

function authorSearchView({ query, result, lang }) {
  const t = getMessages(lang)

  return layout({
    title: `${t.searchAuthors} ${query}`,
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <p class="eyebrow">${escapeHtml(t.searchAuthors)}</p>
  <h1>${escapeHtml(query)}</h1>
  <p class="lead">${escapeHtml(t.summaryAuthorSearch(result.totalCount || result.authors.length))}</p>
  <form class="lookup" action="/author" method="get">
    ${langField(lang)}
    <label for="q">${escapeHtml(t.searchAgain)}</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(query)}" autocomplete="off">
      <button type="submit">${escapeHtml(t.search)}</button>
    </div>
  </form>
</section>
<section class="section">
  ${result.authors.length ? `<div class="author-list">${result.authors.map((item) => authorCard(item, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noSearchResults)}</p>`}
</section>`,
  })
}

function authorView({ author, lang }) {
  const t = getMessages(lang)
  const name = author.displayName || author.userName || 'Author'

  return layout({
    title: name,
    lang,
    body: `<section class="hero compact author-hero">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <div class="author-head">
    ${avatar(author, 'lg')}
    <div>
      <p class="eyebrow">${escapeHtml(t.searchAuthors)}</p>
      <h1>${escapeHtml(name)}</h1>
      <p class="meta">@${escapeHtml(author.userName || '')}</p>
    </div>
  </div>
  ${author.description ? `<p class="summary preserve-lines">${escapeHtml(author.description)}</p>` : ''}
  ${author.ipnsKey ? `<p class="hash-row"><span>IPNS</span><code>${escapeHtml(author.ipnsKey)}</code></p>` : ''}
</section>
<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.recentAuthorArticles)}</p>
    <h2>${escapeHtml(name)}</h2>
  </div>
  ${author.articles.length ? `<div class="article-list">${author.articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
</section>`,
  })
}

function articleCard(article, lang) {
  const t = getMessages(lang)
  const author = article.author || {}
  const authorName = author.displayName || author.userName || t.sourceUnknown
  const hrefValue = article.shortHash ? href(`/article/${encodeURIComponent(article.shortHash)}`, lang) : '#'
  const channel = article.channel?.title
    ? `<span>${escapeHtml(article.channel.title)}</span>`
    : ''

  return `<article class="article-card">
  <h3><a href="${escapeAttr(hrefValue)}">${escapeHtml(article.title || 'Untitled')}</a></h3>
  <p class="meta">By ${escapeHtml(authorName)}${author.userName ? ` (<a href="${href(`/author/${encodeURIComponent(author.userName)}`, lang)}">@${escapeHtml(author.userName)}</a>)` : ''}</p>
  <p class="meta">${formatDate(article.createdAt)}${channel}</p>
  ${article.summary ? `<p>${escapeHtml(trimSummary(article.summary))}</p>` : ''}
</article>`
}

function authorCard(author, lang) {
  return `<article class="author-card">
  ${avatar(author, 'md')}
  <div>
    <h3><a href="${href(`/author/${encodeURIComponent(author.userName)}`, lang)}">${escapeHtml(author.displayName || author.userName || 'Author')}</a></h3>
    <p class="meta">@${escapeHtml(author.userName || '')}</p>
    ${author.description ? `<p>${escapeHtml(trimSummary(author.description))}</p>` : ''}
  </div>
</article>`
}

function channelLink(channel, lang) {
  const t = getMessages(lang)
  return `<a class="channel-link" href="${href(`/channel/${encodeURIComponent(channel.shortHash)}`, lang)}">
  <span>${escapeHtml(channel.title || 'Untitled channel')}</span>
  <small>${channel.articles.length} ${escapeHtml(t.sampledArticles)}</small>
</a>`
}

function avatar(author, size) {
  const name = author.displayName || author.userName || '?'
  if (author.avatar) {
    return `<span class="avatar ${escapeAttr(size)}"><img src="/proxy/image?url=${encodeURIComponent(author.avatar)}" alt="${escapeAttr(name)}"></span>`
  }

  return `<span class="avatar ${escapeAttr(size)}"><span>${escapeHtml(name.slice(0, 1))}</span></span>`
}

function languageNav(lang) {
  return `<nav class="language-nav" aria-label="Language">
  <a ${!isSimplified(lang) ? 'aria-current="true"' : ''} href="?lang=zh-Hant">繁體</a>
  <a ${isSimplified(lang) ? 'aria-current="true"' : ''} href="?lang=zh-Hans">简体</a>
</nav>`
}

function href(path, lang) {
  if (!isSimplified(lang)) {
    return path
  }

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}lang=zh-Hans`
}

function langField(lang) {
  return isSimplified(lang) ? '<input type="hidden" name="lang" value="zh-Hans">' : ''
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
