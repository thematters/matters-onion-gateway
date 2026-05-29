// A tiny in-memory TTL cache with single-flight de-duplication. This is
// intentionally not a Redis/Memcached client: the deployment target is one small
// instance, and the goal is only to collapse bursts of identical upstream reads
// (notably the home feed) into a single GraphQL call per TTL window.
export function createTtlCache({ now = () => Date.now() } = {}) {
  const store = new Map()
  const inflight = new Map()

  function get(key, ttlMs, producer) {
    const hit = store.get(key)
    if (hit && hit.expires > now()) {
      return Promise.resolve(hit.value)
    }

    // Single-flight: while one producer is running, concurrent callers for the
    // same key await the same promise instead of each hitting upstream.
    const pending = inflight.get(key)
    if (pending) {
      return pending
    }

    const promise = Promise.resolve()
      .then(producer)
      .then((value) => {
        store.set(key, { value, expires: now() + ttlMs })
        return value
      })
      .finally(() => {
        inflight.delete(key)
      })

    inflight.set(key, promise)
    return promise
  }

  function clear() {
    store.clear()
    inflight.clear()
  }

  return { get, clear }
}
