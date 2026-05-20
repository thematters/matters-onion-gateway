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
          href: attribs.href || '#',
          rel: 'noreferrer noopener',
          target: '_blank',
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
