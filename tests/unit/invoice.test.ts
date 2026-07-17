import { describe, it, expect } from 'vitest'
import { computeInvoiceTotals, type InvoiceLineItem } from '~/lib/schemas/invoice'

describe('computeInvoiceTotals', () => {
  it('sums parts and labour separately', () => {
    const items: InvoiceLineItem[] = [
      { type: 'part', description: 'Brake pad', qty: 2, unitPrice: 500000, lineTotal: 1000000 },
      { type: 'labour', description: 'Brake replacement', qty: 1, unitPrice: 1200000, lineTotal: 1200000 },
    ]
    const totals = computeInvoiceTotals(items, 7.5)
    expect(totals.partsTotal).toBe(1_000_000)
    expect(totals.labourTotal).toBe(1_200_000)
    expect(totals.subtotal).toBe(2_200_000)
    expect(totals.vat).toBe(165_000) // 7.5% of 2,200,000
    expect(totals.grandTotal).toBe(2_365_000)
  })

  it('handles empty line items', () => {
    const totals = computeInvoiceTotals([], 7.5)
    expect(totals.subtotal).toBe(0)
    expect(totals.vat).toBe(0)
    expect(totals.grandTotal).toBe(0)
  })

  it('rounds VAT to the nearest kobo', () => {
    const items: InvoiceLineItem[] = [
      { type: 'labour', description: 'Oil change', qty: 1, unitPrice: 333, lineTotal: 333 },
    ]
    const totals = computeInvoiceTotals(items, 7.5)
    // 7.5% of 333 = 24.975 -> 25
    expect(totals.vat).toBe(25)
  })
})
