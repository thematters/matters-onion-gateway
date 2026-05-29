import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]

export function sanitizeArticleHtml(html = '') {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      pre: ['class'],
      span: ['class'],
      p: ['class'],
      br: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          href: toSafeLinkHref(attribs.href || ''),
          rel: 'noreferrer noopener',
        },
      }),
      img: (_tagName, attribs) => {
        const src = attribs.src || ''
        return {
          tagName: 'img',
          attribs: {
            src: src ? `/proxy/image?url=${encodeURIComponent(src)}` : '',
            alt: attribs.alt || '',
            loading: 'lazy',
            decoding: 'async',
          },
        }
      },
    },
  })
}

// Route absolute clearnet links through the interstitial warning page so a reader
// is never sent to the clearnet without an explicit, informed click. Relative and
// in-page links are kept as-is; mailto is preserved since it makes no web request.
export function toSafeLinkHref(href) {
  if (!href) {
    return '#'
  }

  let parsed
  try {
    parsed = new URL(href)
  } catch {
    return href
  }

  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    return `/leave?url=${encodeURIComponent(parsed.toString())}`
  }

  if (parsed.protocol === 'mailto:') {
    return href
  }

  return '#'
}
