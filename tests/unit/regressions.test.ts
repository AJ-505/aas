import { describe, it, expect } from 'vitest'
import { updatePartSchema } from '~/lib/schemas/part'
import { isFinalInvoice, pickCurrentJobInvoice, pickFinalInvoice } from '../../convex/lib/invoiceHelpers'
import { mergeDuplicatePartLines } from '~/lib/line-items'

describe('updatePartSchema', () => {
  it('does not inject defaults for absent numeric fields', () => {
    const parsed = updatePartSchema.parse({ brand: 'Toyota' })
    expect(parsed.brand).toBe('Toyota')
    expect(parsed.stockQty).toBeUndefined()
    expect(parsed.reorderLevel).toBeUndefined()
    expect(parsed.costPrice).toBeUndefined()
    expect(parsed.sellingPrice).toBeUndefined()
  })

  it('accepts a partial numeric update without touching other fields', () => {
    const parsed = updatePartSchema.parse({ stockQty: 16 })
    expect(parsed.stockQty).toBe(16)
    expect(parsed.reorderLevel).toBeUndefined()
  })

  it('rejects a negative stock quantity', () => {
    expect(() => updatePartSchema.parse({ stockQty: -1 })).toThrow()
  })

  it('rejects a negative cost price', () => {
    expect(() => updatePartSchema.parse({ costPrice: -100 })).toThrow()
  })
})

describe('invoice final selection', () => {
  const legacy = { _id: 'a', _creationTime: 1, approved: true }
  const estimate = { _id: 'b', _creationTime: 3, kind: 'estimate', status: 'draft' }
  const finalDraft = { _id: 'c', _creationTime: 2, kind: 'final', approved: false }
  const finalApproved = { _id: 'd', _creationTime: 4, kind: 'final', approved: true }

  it('treats a kind-less invoice as a final', () => {
    expect(isFinalInvoice(legacy)).toBe(true)
    expect(isFinalInvoice(estimate)).toBe(false)
    expect(isFinalInvoice(null)).toBe(false)
  })

  it('prefers an approved final over a draft final and an estimate', () => {
    expect(pickCurrentJobInvoice([estimate, finalDraft, finalApproved])).toBe(finalApproved)
  })

  it('prefers a draft final over an estimate', () => {
    expect(pickCurrentJobInvoice([estimate, finalDraft])).toBe(finalDraft)
  })

  it('falls back to the newest invoice when only estimates exist', () => {
    const older = { _id: 'x', _creationTime: 1, kind: 'estimate' }
    const newer = { _id: 'y', _creationTime: 2, kind: 'estimate' }
    expect(pickCurrentJobInvoice([older, newer])).toBe(newer)
  })

  it('never returns an estimate when a final exists', () => {
    const picked = pickCurrentJobInvoice([estimate, legacy])
    expect(picked).toBe(legacy)
  })

  it('pickFinalInvoice ignores estimates', () => {
    expect(pickFinalInvoice([estimate])).toBeNull()
    expect(pickFinalInvoice([estimate, legacy])).toBe(legacy)
  })
})

describe('mergeDuplicatePartLines', () => {
  it('merges two lines of the same part into one', () => {
    const merged = mergeDuplicatePartLines([
      { partId: 'p1', qty: 3 },
      { partId: 'p1', qty: 4 },
    ])
    expect(merged).toEqual([{ partId: 'p1', qty: 7 }])
  })

  it('keeps distinct parts separate and preserves order', () => {
    const merged = mergeDuplicatePartLines([
      { partId: 'p1', qty: 1 },
      { partId: 'p2', qty: 2 },
      { partId: 'p1', qty: 5 },
    ])
    expect(merged).toEqual([
      { partId: 'p1', qty: 6 },
      { partId: 'p2', qty: 2 },
    ])
  })

  it('does not mutate the input items', () => {
    const input = [{ partId: 'p1', qty: 3 }, { partId: 'p1', qty: 4 }]
    mergeDuplicatePartLines(input)
    expect(input[0]!.qty).toBe(3)
  })
})
