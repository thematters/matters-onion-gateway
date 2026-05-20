const CID_PATTERN =
  /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{50,}|bafk[a-z2-7]{50,}|zdpu[1-9A-HJ-NP-Za-km-z]{45,})$/

const SHORT_HASH_PATTERN = /^[a-z0-9]{8,32}$/i

export function identifyArticleInput(rawInput) {
  const input = String(rawInput || '').trim()

  if (!input) {
    return { type: 'empty', value: '' }
  }

  const withoutFragment = input.split('#')[0]

  try {
    const url = new URL(withoutFragment)
    const path = url.pathname.replace(/\/+$/, '')
    const articleMatch = path.match(/\/a\/([^/?]+)$/)

    if (articleMatch?.[1]) {
      return { type: 'shortHash', value: articleMatch[1] }
    }

    const legacyHash = path.match(/(?:-|\/)(bafy[a-z2-7]{50,}|zdpu[1-9A-HJ-NP-Za-km-z]{45,}|Qm[1-9A-HJ-NP-Za-km-z]{44})$/)
    if (legacyHash?.[1]) {
      return { type: 'mediaHash', value: legacyHash[1] }
    }
  } catch {
    // Not a URL. Continue with raw hash detection.
  }

  const slashShortHash = input.match(/^\/?a\/([^/?#]+)$/)
  if (slashShortHash?.[1]) {
    return { type: 'shortHash', value: slashShortHash[1] }
  }

  if (CID_PATTERN.test(input)) {
    return { type: 'cid', value: input }
  }

  if (SHORT_HASH_PATTERN.test(input)) {
    return { type: 'shortHash', value: input }
  }

  return { type: 'unknown', value: input }
}
