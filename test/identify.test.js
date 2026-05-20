import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { identifyArticleInput } from '../src/identify.js'

describe('identifyArticleInput', () => {
  it('detects short hashes in current article URLs', () => {
    assert.deepEqual(
      identifyArticleInput('https://matters.town/a/k7p706m2xlwl'),
      { type: 'shortHash', value: 'k7p706m2xlwl' }
    )
  })

  it('detects slash article paths', () => {
    assert.deepEqual(identifyArticleInput('/a/k7p706m2xlwl'), {
      type: 'shortHash',
      value: 'k7p706m2xlwl',
    })
  })

  it('detects CID input', () => {
    const cid = 'Qmaisz6NMhDB51cCvNWa1GMS7LU1pAxdF4Ld6Ft9kZEP2a'
    assert.deepEqual(identifyArticleInput(cid), { type: 'cid', value: cid })
  })

  it('rejects unrecognized input', () => {
    assert.equal(identifyArticleInput('not a useful input').type, 'unknown')
  })
})
