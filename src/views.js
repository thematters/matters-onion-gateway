import { escapeAttr, escapeHtml } from './escape.js'
import { getMessages, isDefaultLanguage, languages } from './i18n.js'

export function layout({ title, body, status = 200, lang = languages.traditional }) {
  const t = getMessages(lang)

  return {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
    body: `<!doctype html>
<html lang="${escapeAttr(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/images/matters-mark-color.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="site-brand" href="${href('/', lang)}" aria-label="${escapeAttr(t.siteName)}">
      <img src="/images/matters-wordmark.svg" alt="Matters">
      <span class="site-brand-onion" aria-hidden="true">🧅</span>
    </a>
    ${languageNav(lang)}
  </header>
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
  errorKey = '',
  searchErrorKey = '',
  authorErrorKey = '',
  channels = [],
  articles = [],
  lang = languages.traditional,
} = {}) {
  const t = getMessages(lang)

  return layout({
    title: t.siteName,
    lang,
    body: `<section class="hero home-hero">
  <div class="hero-copy">
    <h1>${escapeHtml(t.siteName)}</h1>
    <p class="lead">${escapeHtml(t.intro)}</p>
    <form class="lookup primary-lookup" action="/discover" method="get">
    ${langField(lang)}
    <label for="search-q">${escapeHtml(t.articleLookup)}</label>
    <div class="lookup-row">
      <input id="search-q" name="q" value="${escapeAttr(value)}" placeholder="hi176" autocomplete="off" autofocus>
      <button type="submit">${escapeHtml(t.discover)}</button>
    </div>
    <details class="lookup-examples">
      <summary>${escapeHtml(t.discoverExampleSummary)}</summary>
      <ul>${exampleList(t.discoverExamples)}</ul>
    </details>
  </form>
  ${searchErrorKey ? `<p class="error">${escapeHtml(t[searchErrorKey])}</p>` : ''}
  ${authorErrorKey ? `<p class="error">${escapeHtml(t[authorErrorKey])}</p>` : ''}
  ${errorKey ? `<p class="error">${escapeHtml(t[errorKey])}</p>` : ''}
  ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
  <p class="why-link"><a href="${href('/why-onion', lang)}">${escapeHtml(t.whyOnionCta)}</a></p>
</div>
  <figure class="hero-art"><img src="/images/onion-hero-square.jpg" alt=""></figure>
</section>

${channels.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.publicChannels)}</p>
    <h2>${escapeHtml(t.browseByChannel)}</h2>
  </div>
  <div class="channel-list">${channels.map((channel) => channelLink(channel, lang)).join('')}</div>
</section>` : ''}

${articles.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.latestPublicArticles)}</p>
    <h2>${escapeHtml(t.channelDerivedLatest)}</h2>
  </div>
  <div class="article-list">${articles.map((article) => articleCard(article, lang)).join('')}</div>
</section>` : ''}`,
  })
}

export function whyOnionView({ lang = languages.traditional } = {}) {
  const t = getMessages(lang)

  return layout({
    title: t.whyOnion,
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <h1>${escapeHtml(t.whyOnion)}</h1>
  <p class="lead">${escapeHtml(t.whyOnionIntro)}</p>
</section>
<section class="section">
  <div class="info-grid">${t.whyOnionBlocks.map(infoBlock).join('')}</div>
</section>`,
  })
}

export function discoverView({
  query,
  articleResult,
  authorResult,
  lang = languages.traditional,
}) {
  const t = getMessages(lang)
  const articles = articleResult.articles || []
  const authors = authorResult.authors || []

  return layout({
    title: `${t.discover} ${query}`,
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <p class="eyebrow">${escapeHtml(t.discover)}</p>
  <h1>${escapeHtml(query)}</h1>
  <p class="lead">${escapeHtml(t.summaryDiscover(articles.length, authors.length))}</p>
  <form class="lookup primary-lookup" action="/discover" method="get">
    ${langField(lang)}
    <label for="q">${escapeHtml(t.searchAgain)}</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(query)}" autocomplete="off">
      <button type="submit">${escapeHtml(t.discover)}</button>
    </div>
  </form>
</section>
${authors.length ? `<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.searchAuthors)}</p>
    <h2>${escapeHtml(t.searchAuthorsPlaceholder)}</h2>
  </div>
  <div class="author-list">${authors.map((item) => authorCard(item, lang)).join('')}</div>
</section>` : ''}
<section class="section">
  <div class="section-heading">
    <p class="eyebrow">${escapeHtml(t.searchArticles)}</p>
    <h2>${escapeHtml(t.latestPublicArticles)}</h2>
  </div>
  ${articles.length ? `<div class="article-list">${articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
</section>`,
  })
}

export function articleView({ article, html, comments = [], sourceInput, lang = languages.traditional }) {
  const t = getMessages(lang)
  const author = article.author || {}
  const tags = Array.isArray(article.tags)
    ? article.tags.filter((tag) => tag?.content)
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

  ${tags.length ? `<section class="tags">${tags.map((tag) => tagChip(tag, lang)).join('')}</section>` : ''}

  <section class="content">
    ${html}
  </section>

  <section class="facts article-meta-section">
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

  ${versionsSection(article, lang)}

  <footer class="article-footer">
    ${canonicalUrl ? `<p>${escapeHtml(t.canonicalSource)}: <a href="${escapeAttr(canonicalUrl)}" rel="noreferrer noopener" target="_blank">${escapeHtml(canonicalUrl)}</a></p>` : ''}
    <p>${escapeHtml(t.lookupInput)}: ${escapeHtml(sourceInput)}</p>
  </footer>

  ${commentsSection(comments, article.commentCount || 0, lang)}
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
  nextHref = '',
}) {
  if (mode === 'authors') {
    return authorSearchView({ query, result: authorResult, lang })
  }

  if (mode === 'author') {
    return authorView({ author, lang, nextHref })
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
  <form class="lookup" action="/discover" method="get">
    ${langField(lang)}
    <label for="q">${escapeHtml(t.searchAgain)}</label>
    <div class="lookup-row">
      <input id="q" name="q" value="${escapeAttr(query)}" autocomplete="off">
      <button type="submit">${escapeHtml(t.discover)}</button>
    </div>
  </form>
</section>
<section class="section">
  ${result.articles.length ? `<div class="article-list">${result.articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
  ${paginationNav(nextHref, lang)}
</section>`,
  })
}

export function channelView({ channel, lang = languages.traditional, nextHref = '' }) {
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
  ${paginationNav(nextHref, lang)}
</section>`,
  })
}

export function tagView({ tag, lang = languages.traditional, nextHref = '' }) {
  const t = getMessages(lang)

  return layout({
    title: `#${tag.content}`,
    lang,
    body: `<section class="hero compact">
  <nav class="topnav"><a href="${href('/', lang)}">${escapeHtml(t.home)}</a></nav>
  <p class="eyebrow">${escapeHtml(t.tag)}</p>
  <h1>#${escapeHtml(tag.content || '')}</h1>
  <p class="lead">${escapeHtml(t.tagSummary(tag.numArticles || 0))}</p>
</section>
<section class="section">
  ${tag.articles.length ? `<div class="article-list">${tag.articles.map((article) => articleCard(article, lang)).join('')}</div>` : `<p class="muted">${escapeHtml(t.noReadableArticles)}</p>`}
  ${paginationNav(nextHref, lang)}
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

function versionsSection(article, lang) {
  const t = getMessages(lang)
  const versions = (article.versions?.edges || []).map((edge) => edge?.node).filter(Boolean)

  // A single version is not a history; only show the section when revisions exist.
  if (versions.length <= 1) {
    return ''
  }

  return `<section class="versions">
  <h2>${escapeHtml(t.versionHistory)}</h2>
  <ol class="version-list">${versions.map((version, index) => versionItem(version, versions.length - index, lang)).join('')}</ol>
</section>`
}

function versionItem(version, ordinal, lang) {
  const t = getMessages(lang)
  const cid = version.dataHash || version.mediaHash || ''

  return `<li class="version">
  <p class="meta">${escapeHtml(t.versionLabel(ordinal))} · ${formatDate(version.createdAt)}</p>
  ${version.description ? `<p>${escapeHtml(version.description)}</p>` : ''}
  ${cid ? `<p class="hash-row"><span>dataHash</span><code>${escapeHtml(cid)}</code></p>
  <p><a class="button-link" href="${href(`/ipfs/${encodeURIComponent(cid)}`, lang)}">${escapeHtml(t.openIpfs)}</a></p>` : ''}
</li>`
}

function commentsSection(comments, totalCount, lang) {
  const t = getMessages(lang)

  return `<section class="comments">
  <h2>${escapeHtml(t.comments)}</h2>
  <p class="meta">${escapeHtml(t.commentsReadOnly)}</p>
  ${comments.length
    ? `<ol class="comment-list">${comments.map((comment) => commentItem(comment, lang)).join('')}</ol>
      ${totalCount > comments.length ? `<p class="muted">${escapeHtml(t.commentsTruncated(comments.length, totalCount))}</p>` : ''}`
    : `<p class="muted">${escapeHtml(t.noComments)}</p>`}
</section>`
}

function commentItem(comment, lang) {
  const author = comment.author || {}
  const name = author.displayName || author.userName || getMessages(lang).sourceUnknown
  const replies = Array.isArray(comment.replies) ? comment.replies : []

  return `<li class="comment">
  <div class="comment-head">
    ${avatar(author, 'md')}
    <div>
      <p class="meta">${escapeHtml(name)}${author.userName ? ` (<a href="${href(`/author/${encodeURIComponent(author.userName)}`, lang)}">@${escapeHtml(author.userName)}</a>)` : ''}</p>
      <p class="meta">${formatDate(comment.createdAt)}</p>
    </div>
  </div>
  <div class="comment-body">${comment.html}</div>
  ${replies.length ? `<ol class="comment-replies">${replies.map((reply) => commentItem(reply, lang)).join('')}</ol>` : ''}
</li>`
}

function tagChip(tag, lang) {
  const label = `#${escapeHtml(tag.content)}`
  if (!tag.id) {
    return `<span>${label}</span>`
  }
  return `<a href="${href(`/tag/${encodeURIComponent(tag.id)}`, lang)}">${label}</a>`
}

function paginationNav(nextHref, lang) {
  if (!nextHref) {
    return ''
  }

  const t = getMessages(lang)
  return `<nav class="pagination"><a class="button-link" href="${escapeAttr(nextHref)}">${escapeHtml(t.loadMore)}</a></nav>`
}

function infoBlock(block) {
  return `<article class="info-card">
  <h3>${escapeHtml(block.title)}</h3>
  <p>${escapeHtml(block.body)}</p>
</article>`
}

function authorView({ author, lang, nextHref = '' }) {
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
  ${paginationNav(nextHref, lang)}
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
  <a ${lang === languages.traditional ? 'aria-current="true"' : ''} href="?lang=zh-Hant">繁體</a>
  <a ${lang === languages.simplified ? 'aria-current="true"' : ''} href="?lang=zh-Hans">简体</a>
  <a ${lang === languages.english ? 'aria-current="true"' : ''} href="?lang=en">EN</a>
</nav>`
}

function href(path, lang) {
  if (isDefaultLanguage(lang)) {
    return path
  }

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}lang=${encodeURIComponent(lang)}`
}

function langField(lang) {
  return isDefaultLanguage(lang) ? '' : `<input type="hidden" name="lang" value="${escapeAttr(lang)}">`
}

function exampleList(examples) {
  return examples
    .map((example) => `<li>${escapeHtml(example)}</li>`)
    .join('')
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
