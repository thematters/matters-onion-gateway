// A counting semaphore that bounds how many operations run at once. Used to cap
// concurrent upstream GraphQL requests so a burst of distinct reads cannot pile
// up against the single instance or the Matters backend. Per-IP limiting is
// pointless here because all Tor traffic arrives from the local Tor daemon, so
// the limit is global by design.
export function createSemaphore(max) {
  const limit = Math.max(1, Number(max) || 1)
  let active = 0
  const queue = []

  function release() {
    const next = queue.shift()
    if (next) {
      // Hand the slot directly to the next waiter; active count is unchanged.
      next()
    } else {
      active -= 1
    }
  }

  function acquire() {
    if (active < limit) {
      active += 1
      return Promise.resolve(release)
    }

    return new Promise((resolve) => {
      queue.push(() => resolve(release))
    })
  }

  async function run(fn) {
    const done = await acquire()
    try {
      return await fn()
    } finally {
      done()
    }
  }

  return { acquire, run }
}
