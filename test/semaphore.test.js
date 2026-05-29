import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createSemaphore } from '../src/semaphore.js'

describe('createSemaphore', () => {
  it('never exceeds the concurrency limit', async () => {
    const sem = createSemaphore(2)
    let active = 0
    let peak = 0

    const task = () =>
      sem.run(async () => {
        active += 1
        peak = Math.max(peak, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active -= 1
      })

    await Promise.all(Array.from({ length: 10 }, task))

    assert.equal(peak, 2)
    assert.equal(active, 0)
  })

  it('releases the slot even when the task throws', async () => {
    const sem = createSemaphore(1)

    await assert.rejects(sem.run(() => Promise.reject(new Error('boom'))))
    // If the slot leaked, this second task would hang forever.
    assert.equal(await sem.run(() => Promise.resolve('ok')), 'ok')
  })

  it('runs all queued tasks', async () => {
    const sem = createSemaphore(1)
    const order = []
    await Promise.all([
      sem.run(async () => order.push(1)),
      sem.run(async () => order.push(2)),
      sem.run(async () => order.push(3)),
    ])
    assert.deepEqual(order.sort(), [1, 2, 3])
  })
})
