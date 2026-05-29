import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedHost, isAllowedPort, isPublicAddress } from '../src/net.js'

const allowed = ['assets.matters.news', 'imagedelivery.net']

describe('isAllowedHost', () => {
  it('accepts exact allowlisted hosts', () => {
    assert.equal(isAllowedHost('assets.matters.news', allowed), true)
    assert.equal(isAllowedHost('imagedelivery.net', allowed), true)
  })

  it('accepts subdomains of allowlisted hosts', () => {
    assert.equal(isAllowedHost('cdn.assets.matters.news', allowed), true)
  })

  it('is case-insensitive', () => {
    assert.equal(isAllowedHost('Assets.Matters.News', allowed), true)
  })

  it('rejects non-allowlisted hosts', () => {
    assert.equal(isAllowedHost('evil.com', allowed), false)
    assert.equal(isAllowedHost('169.254.169.254', allowed), false)
    assert.equal(isAllowedHost('localhost', allowed), false)
  })

  it('rejects look-alike suffixes', () => {
    assert.equal(isAllowedHost('assets.matters.news.evil.com', allowed), false)
    assert.equal(isAllowedHost('notassets.matters.news', allowed), false)
    assert.equal(isAllowedHost('', allowed), false)
  })
})

describe('isAllowedPort', () => {
  it('accepts default and standard web ports', () => {
    assert.equal(isAllowedPort(''), true)
    assert.equal(isAllowedPort('80'), true)
    assert.equal(isAllowedPort('443'), true)
  })

  it('rejects other ports', () => {
    assert.equal(isAllowedPort('22'), false)
    assert.equal(isAllowedPort('8080'), false)
    assert.equal(isAllowedPort('3000'), false)
  })
})

describe('isPublicAddress', () => {
  it('accepts public addresses', () => {
    assert.equal(isPublicAddress('1.1.1.1'), true)
    assert.equal(isPublicAddress('104.18.0.1'), true)
    assert.equal(isPublicAddress('2606:4700:4700::1111'), true)
  })

  it('rejects loopback and unspecified', () => {
    assert.equal(isPublicAddress('127.0.0.1'), false)
    assert.equal(isPublicAddress('0.0.0.0'), false)
    assert.equal(isPublicAddress('::1'), false)
    assert.equal(isPublicAddress('::'), false)
  })

  it('rejects private ranges', () => {
    assert.equal(isPublicAddress('10.0.0.5'), false)
    assert.equal(isPublicAddress('172.16.0.1'), false)
    assert.equal(isPublicAddress('172.31.255.255'), false)
    assert.equal(isPublicAddress('192.168.1.1'), false)
  })

  it('rejects the cloud metadata link-local range', () => {
    assert.equal(isPublicAddress('169.254.169.254'), false)
  })

  it('rejects CGNAT and reserved ranges', () => {
    assert.equal(isPublicAddress('100.64.0.1'), false)
    assert.equal(isPublicAddress('224.0.0.1'), false)
    assert.equal(isPublicAddress('255.255.255.255'), false)
  })

  it('rejects IPv6 unique-local and link-local', () => {
    assert.equal(isPublicAddress('fc00::1'), false)
    assert.equal(isPublicAddress('fd12:3456::1'), false)
    assert.equal(isPublicAddress('fe80::1'), false)
  })

  it('unwraps IPv4-mapped IPv6 addresses', () => {
    assert.equal(isPublicAddress('::ffff:127.0.0.1'), false)
    assert.equal(isPublicAddress('::ffff:169.254.169.254'), false)
    assert.equal(isPublicAddress('::ffff:1.1.1.1'), true)
  })

  it('rejects non-IP input', () => {
    assert.equal(isPublicAddress('not-an-ip'), false)
  })
})
