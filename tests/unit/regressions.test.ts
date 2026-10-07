import { describe, it, expect } from 'vitest'
import { updatePartSchema } from '~/lib/schemas/part'
import { isFinalInvoice, pickCurrentJobInvoice, pickFinalInvoice } from '../../convex/lib/invoiceHelpers'
import { sumQtyByPartId } from '~/lib/line-items'
import { counterSaleSchema } from '~/lib/schemas/counter'
import { warehouseTransferSchema } from '~/lib/schemas/warehouse'

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
  type InvoiceFixture = { _id: string; _creationTime: number; kind?: string; approved?: boolean; status?: string }
  const legacy: InvoiceFixture = { _id: 'a', _creationTime: 1, approved: true }
  const estimate: InvoiceFixture = { _id: 'b', _creationTime: 3, kind: 'estimate', status: 'draft' }
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

describe('sumQtyByPartId', () => {
  it('sums duplicate lines and keeps distinct parts separate', () => {
    const totals = sumQtyByPartId([
      { partId: 'p1', qty: 1 },
      { partId: 'p2', qty: 2 },
      { partId: 'p1', qty: 4 },
    ])
    expect(totals.get('p1')).toBe(5)
    expect(totals.get('p2')).toBe(2)
  })

  it('sums duplicate lines that carry per-line metadata', () => {
    const totals = sumQtyByPartId([
      { partId: 'p1', qty: 1, unit: 'carton', remarks: 'A' },
      { partId: 'p1', qty: 2, unit: 'piece', remarks: 'B' },
    ])
    expect(totals.get('p1')).toBe(3)
  })

  it('returns an empty map for no items', () => {
    expect(sumQtyByPartId([]).size).toBe(0)
  })
})

describe('line validation must precede aggregation', () => {
  it('the schema rejects a fractional quantity on a raw line', () => {
    expect(() =>
      counterSaleSchema.parse({ items: [{ partId: 'p1', qty: 0.5 }] }),
    ).toThrow()
  })

  it('rejects two fractional lines that a merge-first handler would accept as one', () => {
    expect(() =>
      counterSaleSchema.parse({
        items: [
          { partId: 'p1', qty: 0.5 },
          { partId: 'p1', qty: 0.5 },
        ],
      }),
    ).toThrow()
  })

  it('the schema rejects a negative quantity on a raw line', () => {
    expect(() =>
      warehouseTransferSchema.parse({
        fromWarehouseId: 'w1',
        toWarehouseId: 'w2',
        items: [{ partId: 'p1', qty: -1 }],
      }),
    ).toThrow()
  })
})
