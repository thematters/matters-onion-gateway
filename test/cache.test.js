import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createTtlCache } from '../src/cache.js'

describe('createTtlCache', () => {
  it('caches a value within the TTL window', async () => {
    let calls = 0
    const cache = createTtlCache({ now: () => 1000 })
    const producer = () => Promise.resolve(++calls)

    assert.equal(await cache.get('k', 100, producer), 1)
    assert.equal(await cache.get('k', 100, producer), 1)
    assert.equal(calls, 1)
  })

  it('recomputes after the TTL expires', async () => {
    let calls = 0
    let clock = 1000
    const cache = createTtlCache({ now: () => clock })
    const producer = () => Promise.resolve(++calls)

    assert.equal(await cache.get('k', 100, producer), 1)
    clock = 1101 // past expiry
    assert.equal(await cache.get('k', 100, producer), 2)
    assert.equal(calls, 2)
  })

  it('single-flights concurrent calls for the same key', async () => {
    let calls = 0
    const cache = createTtlCache({ now: () => 0 })
    const producer = () =>
      new Promise((resolve) => {
        calls += 1
        setTimeout(() => resolve(calls), 5)
      })

    const [a, b, c] = await Promise.all([
      cache.get('k', 100, producer),
      cache.get('k', 100, producer),
      cache.get('k', 100, producer),
    ])

    assert.equal(calls, 1)
    assert.deepEqual([a, b, c], [1, 1, 1])
  })

  it('does not cache a rejected producer', async () => {
    let calls = 0
    const cache = createTtlCache({ now: () => 0 })
    const producer = () => {
      calls += 1
      return Promise.reject(new Error('boom'))
    }

    await assert.rejects(cache.get('k', 100, producer))
    await assert.rejects(cache.get('k', 100, producer))
    assert.equal(calls, 2)
  })
})
