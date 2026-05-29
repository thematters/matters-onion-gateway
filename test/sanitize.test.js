import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeArticleHtml, toSafeLinkHref } from '../src/sanitize.js'

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

  it('routes external links through the interstitial and drops target', () => {
    const html = sanitizeArticleHtml('<a href="https://example.com/path">x</a>')

    assert.match(html, /rel="noreferrer noopener"/)
    assert.match(html, /href="\/leave\?url=https%3A%2F%2Fexample\.com%2Fpath"/)
    assert.doesNotMatch(html, /target="_blank"/)
  })
})

describe('toSafeLinkHref', () => {
  it('wraps http and https links', () => {
    assert.equal(toSafeLinkHref('https://example.com/a'), '/leave?url=https%3A%2F%2Fexample.com%2Fa')
    assert.equal(toSafeLinkHref('http://example.com/'), '/leave?url=http%3A%2F%2Fexample.com%2F')
  })

  it('keeps mailto and relative links untouched', () => {
    assert.equal(toSafeLinkHref('mailto:hi@example.com'), 'mailto:hi@example.com')
    assert.equal(toSafeLinkHref('/relative/path'), '/relative/path')
    assert.equal(toSafeLinkHref('#anchor'), '#anchor')
  })

  it('falls back to # for empty or unknown schemes', () => {
    assert.equal(toSafeLinkHref(''), '#')
    assert.equal(toSafeLinkHref('javascript:alert(1)'), '#')
  })
})
