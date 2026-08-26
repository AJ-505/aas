import { z } from 'zod'
import { moneyKobo, vatRate } from './common'

export const labourTypeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  fixedPrice: moneyKobo,
})

export const invoiceSettingsSchema = z.object({
  vatRate,
})

export const approveInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
})

export const PAYMENT_METHODS = ["cash", "transfer", "card", "pos", "bank"] as const
export const paymentMethodSchema = z.enum(PAYMENT_METHODS)

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1).max(64),
  amount: moneyKobo,
  method: paymentMethodSchema,
})

export const createEstimateSchema = z.object({
  jobId: z.string().optional(),
  salesOrderId: z.string().optional(),
  domain: z.enum(['service', 'sales']).default('service'),
})

export const updateEstimateSchema = z.object({
  invoiceId: z.string().min(1),
})

export const rejectEstimateSchema = z.object({
  invoiceId: z.string().min(1),
  reason: z.string().trim().min(3).max(300),
})

export const adminUnlockSchema = z.object({
  invoiceId: z.string().min(1),
  reason: z.string().trim().min(10).max(300),
})

// Pure helper used by both client previews and Convex invoice generation.
export const invoiceLineItemSchema = z.object({
  type: z.enum(['part', 'labour']),
  description: z.string(),
  qty: z.number().int().min(1),
  unitPrice: moneyKobo,
  lineTotal: moneyKobo,
})

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>

export interface InvoiceTotals {
  partsTotal: number
  labourTotal: number
  subtotal: number
  vat: number
  grandTotal: number
}

export function computeInvoiceTotals(
  items: InvoiceLineItem[],
  vatRatePercent: number,
): InvoiceTotals {
  const partsTotal = items
    .filter((i) => i.type === 'part')
    .reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const labourTotal = items
    .filter((i) => i.type === 'labour')
    .reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const subtotal = partsTotal + labourTotal
  const vat = Math.round((subtotal * vatRatePercent) / 100)
  return {
    partsTotal,
    labourTotal,
    subtotal,
    vat,
    grandTotal: subtotal + vat,
  }
}
