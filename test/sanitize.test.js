import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeArticleHtml } from '../src/sanitize.js'

describe('sanitizeArticleHtml', () => {
  it('removes scripts and rewrites images', () => {
    const html = sanitizeArticleHtml(
      '<p>Hello</p><script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(1)">'
    )

    assert.match(html, /<p>Hello<\/p>/)
    assert.doesNotMatch(html, /script/)
    assert.doesNotMatch(html, /onerror/)
    assert.match(html, /\/proxy\/image\?url=/)
  })

  it('adds safer link attributes', () => {
    const html = sanitizeArticleHtml('<a href="https://example.com">x</a>')

    assert.match(html, /rel="noreferrer noopener"/)
    assert.match(html, /target="_blank"/)
  })
})
