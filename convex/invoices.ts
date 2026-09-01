import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { computeInvoiceTotals, type InvoiceLineItem } from '../src/lib/schemas/invoice'
import {
  buildLineItemsForJob,
  buildLineItemsForSalesOrder,
  nextInvoiceNumber,
  assertNotLocked,
} from './lib/invoiceHelpers'
import { enforce, enforceDedup } from "./lib/rateLimit";

// Queries

export const getByJob = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx)
    // Return the final invoice if exists, else the most recent (estimate or final)
    const all = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    if (all.length === 0) return null
    const finalApproved = all.find((i) => (i as any).kind === 'final' && i.approved)
    const picked = finalApproved ?? all.find((i) => (i as any).kind === 'final') ?? all[0] ?? null
    if (!picked) return null
    if (me.role !== 'admin' && (picked as any).generatedById) {
      const { generatedById: _omit, ...rest } = picked as any
      return rest
    }
    return picked
  },
})

export const listByJob = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx)
    const all = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    const sorted = all.sort((a, b) => b._creationTime - a._creationTime)
    return await Promise.all(sorted.map(async (inv: any) => {
      const generationHistory = me.role === 'admin'
        ? await (async () => {
            const logs = await ctx.db
              .query('auditLogs')
              .withIndex('entityId', (q) => q.eq('entityId', inv._id))
              .collect()
            const generationLogs = logs.filter((log) =>
              log.entity === 'invoices' &&
              (log.action === 'invoice.generate' || log.action === 'invoice.regenerate'),
            ).sort((a, b) => a.ts - b.ts)
            return await Promise.all(generationLogs.map(async (log) => {
              const actor: any = await ctx.db.get(log.userId)
              return {
                action: log.action === 'invoice.generate' ? 'generated' : 'regenerated',
                ts: log.ts,
                user: actor ? { _id: actor._id, name: actor.name ?? null, email: actor.email ?? null } : null,
              }
            }))
          })()
        : undefined
      if (me.role !== 'admin') {
        if (inv.generatedById) {
          const { generatedById: _omit, ...rest } = inv
          return rest
        }
        return inv
      }
      return { ...inv, generationHistory }
    }))
  },
})

export const listBySalesOrder = query({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('invoices')
      .withIndex('salesOrderId', (q) => q.eq('salesOrderId', args.salesOrderId))
      .collect()
  },
})

export const getById = query({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    const payments = await ctx.db
      .query('payments')
      .withIndex('invoiceId', (q) => q.eq('invoiceId', args.invoiceId))
      .collect()
    // generatedBy visible to admin only (projection)
    const me = await requireUser(ctx)
    let generatedBy: any = null
    if (me.role === 'admin' && (invoice as any).generatedById) {
      const u: any = await ctx.db.get((invoice as any).generatedById)
      if (u) generatedBy = { _id: u._id, name: (u as any).name ?? null, email: (u as any).email ?? null }
    }
    return { invoice, payments, generatedBy }
  },
})

// ---- Shared helper to build lineItems + totals for service ----
// Refactored duplication: all mutations use buildLineItemsForJob
async function prepareTotalsForJob(ctx: any, jobId: any) {
  const lineItems = await buildLineItemsForJob(ctx, jobId)
  if (lineItems.length === 0) {
    throw new ConvexError('Cannot generate invoice: no job items found. Add parts or labour first.')
  }
  const settings = await ctx.db.query('settings').first()
  const vatRate = settings?.vatRate ?? 7.5
  const totals = computeInvoiceTotals(lineItems, vatRate)
  return { lineItems, totals }
}

// FINAL INVOICE GENERATION (service)
export const generate = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    const existing = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    // pick existing final if any
    const existingFinal = existing.find((e: any) => e.kind === 'final' || !e.kind)
    if (existingFinal) {
      assertNotLocked(existingFinal)
      if (existingFinal.paid) throw new ConvexError('Cannot regenerate an invoice that is already paid.')
    }

    const { lineItems, totals } = await prepareTotalsForJob(ctx, args.jobId)

    if (existingFinal) {
      await ctx.db.patch(existingFinal._id, {
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
        locked: false,
      })
      await audit(ctx, 'invoice.regenerate', 'invoices', existingFinal._id)
      return existingFinal._id
    }

    const invoiceNumber = await nextInvoiceNumber(ctx, 'final')
    const invoiceId = await ctx.db.insert('invoices', {
      jobId: args.jobId,
      domain: 'service',
      kind: 'final',
      invoiceNumber,
      status: 'draft',
      lineItems,
      partsTotal: totals.partsTotal,
      labourTotal: totals.labourTotal,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      approved: false,
      paid: false,
      amountPaid: 0,
      locked: false,
      generatedById: user._id,
    })
    await audit(ctx, 'invoice.generate', 'invoices', invoiceId)
    return invoiceId
  },
})

// GENERATE SALES FINAL INVOICE
export const generateSales = mutation({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['finance', 'manager', 'admin', 'salesRep'])
    
    await enforce(ctx, "financial");const order = await ctx.db.get(args.salesOrderId)
    if (!order) throw new ConvexError('Sales order not found.')
    const existing = await ctx.db
      .query('invoices')
      .withIndex('salesOrderId', (q) => q.eq('salesOrderId', args.salesOrderId))
      .first()
    if (existing) {
      assertNotLocked(existing)
      if (existing.paid) throw new ConvexError('Cannot regenerate a sales invoice that is already paid.')
    }
    const { lineItems } = await buildLineItemsForSalesOrder(ctx, args.salesOrderId)
    const settings = await ctx.db.query('settings').first()
    const vatRate = settings?.vatRate ?? 7.5
    const totals = computeInvoiceTotals(lineItems, vatRate)
    if (existing) {
      await ctx.db.patch(existing._id, {
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
        locked: false,
      })
      await audit(ctx, 'invoice.regenerateSales', 'invoices', existing._id)
      return existing._id
    }
    const invoiceNumber = await nextInvoiceNumber(ctx, 'final')
    const invoiceId = await ctx.db.insert('invoices', {
      salesOrderId: args.salesOrderId,
      domain: 'sales',
      kind: 'final',
      invoiceNumber,
      status: 'draft',
      lineItems,
      partsTotal: totals.partsTotal,
      labourTotal: totals.labourTotal,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      approved: false,
      paid: false,
      amountPaid: 0,
      locked: false,
      generatedById: user._id,
    })
    await audit(ctx, 'invoice.generateSales', 'invoices', invoiceId)
    return invoiceId
  },
})

export const regenerate = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    const existingList = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    const existing = existingList.find((e: any) => e.kind === 'final' || !e.kind)
    if (existing) {
      assertNotLocked(existing)
      if (existing.paid) throw new ConvexError('Cannot regenerate an invoice that is already paid.')
    }

    const { lineItems, totals } = await prepareTotalsForJob(ctx, args.jobId)

    if (existing) {
      await ctx.db.patch(existing._id, {
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
        locked: false,
        status: 'draft',
      })
      await audit(ctx, 'invoice.regenerate', 'invoices', existing._id)
      return existing._id
    }

    const invoiceNumber = await nextInvoiceNumber(ctx, 'final')
    const user = await requireUser(ctx)
    const invoiceId = await ctx.db.insert('invoices', {
      jobId: args.jobId,
      domain: 'service',
      kind: 'final',
      invoiceNumber,
      status: 'draft',
      lineItems,
      partsTotal: totals.partsTotal,
      labourTotal: totals.labourTotal,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      approved: false,
      paid: false,
      amountPaid: 0,
      locked: false,
      generatedById: user._id,
    })
    await audit(ctx, 'invoice.generate', 'invoices', invoiceId)
    return invoiceId
  },
})

export const approve = mutation({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if (invoice.approved) throw new ConvexError('Invoice is already approved.')
    // Only final invoices lock; estimates use approveEstimate
    const isEstimate = (invoice as any).kind === 'estimate'
    if (isEstimate) throw new ConvexError('Use approveEstimate for estimates.')
    await ctx.db.patch(args.invoiceId, {
      approved: true,
      approvedTs: Date.now(),
      status: 'approved',
      locked: true,
      generatedById: (invoice as any).generatedById ?? user._id,
    })
    await audit(ctx, 'invoice.approve', 'invoices', args.invoiceId)
    return null
  },
})

// ---- ESTIMATE LIFECYCLE ----

export const createEstimate = mutation({
  args: {
    jobId: v.optional(v.id('jobs')),
    salesOrderId: v.optional(v.id('salesOrders')),
    domain: v.optional(v.union(v.literal('service'), v.literal('sales'))),
    lineItems: v.optional(v.array(v.object({
      type: v.union(v.literal('part'), v.literal('labour')),
      description: v.string(),
      qty: v.number(),
      unitPrice: v.number(),
      lineTotal: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['csr', 'manager', 'admin', 'salesRep'])
    
    await enforce(ctx, "financial");const domain = args.domain ?? 'service'
    if (domain === 'service') {
      if (!args.jobId) throw new ConvexError('jobId required for service estimates.')
      const job = await ctx.db.get(args.jobId)
      if (!job) throw new ConvexError('Job not found.')
      const existingEstimates = await ctx.db.query('invoices').withIndex('jobId', (q) => q.eq('jobId', args.jobId!)).collect()
      if (existingEstimates.some((estimate: any) => estimate.kind === 'estimate' && estimate.status === 'draft')) {
        throw new ConvexError('Accept or reject the current estimate before creating another.')
      }
      let lineItems: InvoiceLineItem[]
      let totals: ReturnType<typeof computeInvoiceTotals>
      if (args.lineItems) {
        lineItems = args.lineItems.map((item) => ({
          ...item,
          description: item.description.trim(),
          lineTotal: item.qty * item.unitPrice,
        }))
        if (lineItems.length === 0 || lineItems.some((item) => !item.description || !Number.isInteger(item.qty) || item.qty <= 0 || item.unitPrice < 0)) {
          throw new ConvexError('Manual estimates need a description, positive quantity, and non-negative unit price for every line.')
        }
        const settings = await ctx.db.query('settings').first()
        totals = computeInvoiceTotals(lineItems, settings?.vatRate ?? 7.5)
      } else {
        const prepared = await prepareTotalsForJob(ctx, args.jobId)
        lineItems = prepared.lineItems
        totals = prepared.totals
      }
      const invoiceNumber = await nextInvoiceNumber(ctx, 'estimate')
      const invoiceId = await ctx.db.insert('invoices', {
        jobId: args.jobId,
        domain: 'service',
        kind: 'estimate',
        invoiceNumber,
        status: 'draft',
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
        paid: false,
        amountPaid: 0,
        locked: false,
        generatedById: user._id,
      })
      await audit(ctx, 'invoice.createEstimate', 'invoices', invoiceId)
      return invoiceId
    } else {
      if (!args.salesOrderId) throw new ConvexError('salesOrderId required for sales estimates.')
      const order = await ctx.db.get(args.salesOrderId)
      if (!order) throw new ConvexError('Sales order not found.')
      const existingEstimates = await ctx.db.query('invoices').withIndex('salesOrderId', (q) => q.eq('salesOrderId', args.salesOrderId!)).collect()
      if (existingEstimates.some((estimate: any) => estimate.kind === 'estimate' && estimate.status === 'draft')) {
        throw new ConvexError('Accept or reject the current estimate before creating another.')
      }
      const { lineItems } = await buildLineItemsForSalesOrder(ctx, args.salesOrderId)
      const settings = await ctx.db.query('settings').first()
      const vatRate = settings?.vatRate ?? 7.5
      const totals = computeInvoiceTotals(lineItems, vatRate)
      const invoiceNumber = await nextInvoiceNumber(ctx, 'estimate')
      const invoiceId = await ctx.db.insert('invoices', {
        salesOrderId: args.salesOrderId,
        domain: 'sales',
        kind: 'estimate',
        invoiceNumber,
        status: 'draft',
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
        paid: false,
        amountPaid: 0,
        locked: false,
        generatedById: user._id,
      })
      await audit(ctx, 'invoice.createEstimateSales', 'invoices', invoiceId)
      return invoiceId
    }
  },
})

export const updateEstimate = mutation({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'manager', 'admin', 'salesRep'])

    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if ((invoice as any).kind !== 'estimate') throw new ConvexError('Only estimates can be refreshed via this path.')
    throw new ConvexError('Estimates are static snapshots and cannot be refreshed from current job items.')
  },
})

export const approveEstimate = mutation({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if ((invoice as any).kind !== 'estimate') throw new ConvexError('Only estimates can be approved via this path.')
    if ((invoice as any).status !== 'draft') throw new ConvexError('Estimate is not draft.')
    await ctx.db.patch(args.invoiceId, {
      status: 'approved',
      approved: true,
      approvedTs: Date.now(),
    })
    await audit(ctx, 'invoice.approveEstimate', 'invoices', args.invoiceId)
    return null
  },
})

export const rejectEstimate = mutation({
  args: { invoiceId: v.id('invoices'), reason: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");if (!args.reason.trim() || args.reason.trim().length < 3) throw new ConvexError('Rejection reason must be at least 3 characters.')
    if (args.reason.trim().length > 300) throw new ConvexError('Reason too long.')
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if ((invoice as any).kind !== 'estimate') throw new ConvexError('Only estimates can be rejected.')
    if ((invoice as any).status !== 'draft') throw new ConvexError('Only draft estimates can be rejected.')
    await ctx.db.patch(args.invoiceId, {
      status: 'rejected',
      rejectedReason: args.reason.trim(),
    })
    await audit(ctx, `invoice.rejectEstimate:${args.reason.trim().slice(0, 80)}`, 'invoices', args.invoiceId)
    return null
  },
})

export const convertEstimateToFinal = mutation({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    const estimate = await ctx.db.get(args.invoiceId)
    if (!estimate) throw new ConvexError('Estimate not found.')
    if ((estimate as any).kind !== 'estimate') throw new ConvexError('Only estimates can be converted.')
    throw new ConvexError('Estimate-to-final conversion is disabled. Generate a fresh final invoice instead.')
  },
})

export const adminUnlock = mutation({
  args: { invoiceId: v.id('invoices'), reason: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    
    await enforce(ctx, "financial");if (!args.reason.trim() || args.reason.trim().length < 10) throw new ConvexError('Unlock reason must be at least 10 characters.')
    if (args.reason.trim().length > 300) throw new ConvexError('Reason too long.')
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if (!(invoice as any).locked) throw new ConvexError('Invoice is not locked.')
    if ((invoice as any).paid || invoice.amountPaid > 0) {
      throw new ConvexError('Cannot unlock an invoice after payment has been recorded.')
    }
    await ctx.db.patch(args.invoiceId, { locked: false })
    await audit(ctx, `invoice.adminUnlock:${args.reason.trim().slice(0, 80)}`, 'invoices', args.invoiceId)
    return null
  },
})
