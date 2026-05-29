import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildRssFeed } from '../src/feed.js'

const sample = {
  title: 'Onion Gateway',
  description: 'Anonymous reader',
  homeUrl: 'http://abc.onion/',
  selfUrl: 'http://abc.onion/feed.xml',
  articleUrl: (a) => `http://abc.onion/article/${a.shortHash}`,
  articles: [
    { shortHash: 'aaa', title: 'First & <b>bold</b>', summary: 'hi', createdAt: '2026-01-02T03:04:05.000Z' },
    { shortHash: 'bbb', title: 'Second', summary: '', createdAt: 'not-a-date' },
  ],
}

describe('buildRssFeed', () => {
  it('produces a valid RSS 2.0 envelope', () => {
    const xml = buildRssFeed(sample)
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
    assert.match(xml, /<rss version="2\.0"/)
    assert.match(xml, /<channel>/)
    assert.match(xml, /<atom:link href="http:\/\/abc\.onion\/feed\.xml" rel="self"/)
  })

  it('escapes XML-significant characters in titles', () => {
    const xml = buildRssFeed(sample)
    assert.match(xml, /<title>First &amp; &lt;b&gt;bold&lt;\/b&gt;<\/title>/)
  })

  it('links items through the provided articleUrl', () => {
    const xml = buildRssFeed(sample)
    assert.match(xml, /<link>http:\/\/abc\.onion\/article\/aaa<\/link>/)
    assert.match(xml, /<guid isPermaLink="false">aaa<\/guid>/)
  })

  it('emits pubDate only for valid dates', () => {
    const xml = buildRssFeed(sample)
    assert.match(xml, /<pubDate>Fri, 02 Jan 2026 03:04:05 GMT<\/pubDate>/)
    // The second item has an unparseable date and must not emit a pubDate.
    const secondItem = xml.split('<item>')[2]
    assert.doesNotMatch(secondItem, /<pubDate>/)
  })

  it('omits description when summary is empty', () => {
    const xml = buildRssFeed(sample)
    const secondItem = xml.split('<item>')[2]
    assert.doesNotMatch(secondItem, /<description>/)
  })

  it('omits the self link when selfUrl is not provided', () => {
    const xml = buildRssFeed({ ...sample, selfUrl: '' })
    assert.doesNotMatch(xml, /atom:link/)
  })
})
