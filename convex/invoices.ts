import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { computeInvoiceTotals, type InvoiceLineItem } from '../src/lib/schemas/invoice'

export const getByJob = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return (
      (await ctx.db
        .query('invoices')
        .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
        .first()) ?? null
    )
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
    return { invoice, payments }
  },
})

export const generate = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    // Check if invoice already exists
    const existing = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .first()

    // Get job items
    const jobItems = await ctx.db
      .query('jobItems')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    if (jobItems.length === 0) {
      throw new ConvexError('Cannot generate invoice: no job items found. Add parts or labour first.')
    }

    // Build line items snapshot
    const lineItems: InvoiceLineItem[] = jobItems.map((item) => ({
      type: item.type,
      description: '',
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    }))

    // Fill in descriptions from parts/labour types
    for (const [i, item] of jobItems.entries()) {
      const li = lineItems[i]
      if (!li) continue
      if (item.type === 'part' && item.partId) {
        const part = await ctx.db.get(item.partId)
        if (part) li.description = `${part.code} - ${part.description}`
      } else if (item.type === 'labour' && item.labourTypeId) {
        const lt = await ctx.db.get(item.labourTypeId)
        if (lt) li.description = lt.name
      }
    }

    // Get VAT rate from settings
    const settings = await ctx.db.query('settings').first()
    const vatRate = settings?.vatRate ?? 7.5

    const totals = computeInvoiceTotals(lineItems, vatRate)

    if (existing) {
      if (existing.paid) {
        throw new ConvexError('Cannot regenerate an invoice that is already paid.')
      }
      await ctx.db.patch(existing._id, {
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
      })
      await audit(ctx, 'invoice.regenerate', 'invoices', existing._id)
      return existing._id
    }

    const invoiceId = await ctx.db.insert('invoices', {
      jobId: args.jobId,
      lineItems,
      partsTotal: totals.partsTotal,
      labourTotal: totals.labourTotal,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      approved: false,
      paid: false,
      amountPaid: 0,
    })
    await audit(ctx, 'invoice.generate', 'invoices', invoiceId)
    return invoiceId
  },
})

export const regenerate = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    const existing = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .first()

    const jobItems = await ctx.db
      .query('jobItems')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    if (jobItems.length === 0) {
      throw new ConvexError('Cannot regenerate invoice: no job items found.')
    }

    const lineItems: InvoiceLineItem[] = jobItems.map((item) => ({
      type: item.type,
      description: '',
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    }))

    for (const [i, item] of jobItems.entries()) {
      const li = lineItems[i]
      if (!li) continue
      if (item.type === 'part' && item.partId) {
        const part = await ctx.db.get(item.partId)
        if (part) li.description = `${part.code} - ${part.description}`
      } else if (item.type === 'labour' && item.labourTypeId) {
        const lt = await ctx.db.get(item.labourTypeId)
        if (lt) li.description = lt.name
      }
    }

    const settings = await ctx.db.query('settings').first()
    const vatRate = settings?.vatRate ?? 7.5
    const totals = computeInvoiceTotals(lineItems, vatRate)

    if (existing) {
      if (existing.paid) {
        throw new ConvexError('Cannot regenerate an invoice that is already paid.')
      }
      await ctx.db.patch(existing._id, {
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: false,
      })
      await audit(ctx, 'invoice.regenerate', 'invoices', existing._id)
      return existing._id
    }

    const invoiceId = await ctx.db.insert('invoices', {
      jobId: args.jobId,
      lineItems,
      partsTotal: totals.partsTotal,
      labourTotal: totals.labourTotal,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      approved: false,
      paid: false,
      amountPaid: 0,
    })
    await audit(ctx, 'invoice.generate', 'invoices', invoiceId)
    return invoiceId
  },
})

export const approve = mutation({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['finance', 'manager', 'admin'])
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if (invoice.approved) throw new ConvexError('Invoice is already approved.')

    await ctx.db.patch(args.invoiceId, {
      approved: true,
      approvedTs: Date.now(),
    })
    await audit(ctx, 'invoice.approve', 'invoices', args.invoiceId)
    return null
  },
})
