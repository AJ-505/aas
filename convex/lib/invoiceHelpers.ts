import { ConvexError } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import { computeInvoiceTotals, type InvoiceLineItem } from '../../src/lib/schemas/invoice'

export async function buildLineItemsForJob(ctx: any, jobId: Id<'jobs'>): Promise<InvoiceLineItem[]> {
  const jobItems = await ctx.db
    .query('jobItems')
    .withIndex('jobId', (q: any) => q.eq('jobId', jobId))
    .collect()
  if (jobItems.length === 0) return []
  const lineItems: InvoiceLineItem[] = jobItems.map((item: any) => ({
    type: item.type,
    description: '',
    qty: item.qty,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  }))
  await Promise.all(
    jobItems.map(async (item: any, i: number) => {
      const li = lineItems[i]
      if (!li) return
      if (item.type === 'part' && item.partId) {
        const part = await ctx.db.get(item.partId)
        if (part) li.description = `${part.code} - ${part.description}`
      } else if (item.type === 'labour' && item.labourTypeId) {
        const lt = await ctx.db.get(item.labourTypeId)
        if (lt) li.description = lt.name
      }
    }),
  )
  return lineItems
}

export async function buildLineItemsForSalesOrder(
  ctx: any,
  salesOrderId: Id<'salesOrders'>,
): Promise<{ lineItems: InvoiceLineItem[]; agreedPrice: number; vehicleLabel: string }> {
  const order = await ctx.db.get(salesOrderId)
  if (!order) throw new ConvexError('Sales order not found.')
  const vehicle = await ctx.db.get(order.vehicleId)
  const label = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.plate ?? ''}`.trim() : 'Vehicle'
  const lineItems: InvoiceLineItem[] = [
    {
      type: 'labour',
      description: label,
      qty: 1,
      unitPrice: order.agreedPrice,
      lineTotal: order.agreedPrice,
    },
  ]
  return { lineItems, agreedPrice: order.agreedPrice, vehicleLabel: label }
}

export async function nextInvoiceNumber(
  ctx: any,
  kind: 'estimate' | 'final',
): Promise<string> {
  const nowYear = new Date().getFullYear()
  let settings = await ctx.db.query('settings').first()
  if (!settings) {
    const id = await ctx.db.insert('settings', {
      vatRate: 7.5,
      nextEstSeq: 1,
      nextInvSeq: 1,
      estYear: nowYear,
      invYear: nowYear,
    })
    settings = await ctx.db.get(id)
  }
  if (!settings) throw new ConvexError('Settings missing')
  const isEst = kind === 'estimate'
  const seqField = isEst ? 'nextEstSeq' : 'nextInvSeq'
  const yearField = isEst ? 'estYear' : 'invYear'
  let seq: number = (settings as any)[seqField] ?? 1
  let storedYear: number | undefined = (settings as any)[yearField]
  if (storedYear !== nowYear) {
    seq = 1
  }
  const prefix = isEst ? 'EST' : 'INV'
  const formatted = `${prefix}-${nowYear}-${String(seq).padStart(4, '0')}`
  await ctx.db.patch(settings._id, {
    [seqField]: seq + 1,
    [yearField]: nowYear,
  } as any)
  return formatted
}

export function assertNotLocked(invoice: any) {
  if (invoice?.locked) {
    throw new ConvexError('Invoice is locked — unlock by Admin required.')
  }
}

export async function computeAndInsertTotals(
  ctx: any,
  lineItems: InvoiceLineItem[],
): Promise<ReturnType<typeof computeInvoiceTotals>> {
  const settings = await ctx.db.query('settings').first()
  const vatRate = settings?.vatRate ?? 7.5
  return computeInvoiceTotals(lineItems, vatRate)
}

export async function findApprovedFinalForJob(ctx: any, jobId: Id<'jobs'>) {
  const invoices = await ctx.db
    .query('invoices')
    .withIndex('jobId', (q: any) => q.eq('jobId', jobId))
    .collect()
  return invoices.find((inv: any) => inv.kind === 'final' && inv.approved) ?? null
}

export async function findApprovedFinalForSalesOrder(ctx: any, salesOrderId: Id<'salesOrders'>) {
  const invoices = await ctx.db
    .query('invoices')
    .withIndex('salesOrderId', (q: any) => q.eq('salesOrderId', salesOrderId))
    .collect()
  return invoices.find((inv: any) => inv.kind === 'final' && inv.approved) ?? null
}
