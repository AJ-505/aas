import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { requireUser } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import {
  computeInvoiceTotals,
  type InvoiceLineItem,
} from '../src/lib/schemas/invoice'
import { counterSaleSchema } from '../src/lib/schemas'
import { nextDocumentNumber } from './lib/documentNumbers'
import { enforce } from './lib/rateLimit'

const COUNTER_SALE_ROLES = ['csr', 'admin'] as const

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db
      .query('counterSales')
      .withIndex('by_ts')
      .order('desc')
      .take(200)
  },
})

export const get = query({
  args: { counterSaleId: v.id('counterSales') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const sale = await ctx.db.get(args.counterSaleId)
    if (!sale) throw new ConvexError('Counter sale not found.')
    const createdBy = await ctx.db.get(sale.createdById)
    return {
      sale,
      createdBy: createdBy
        ? { _id: createdBy._id, name: createdBy.name ?? null, email: createdBy.email ?? null }
        : null,
    }
  },
})

export const create = mutation({
  args: {
    customerId: v.id('customers'),
    paymentMethod: v.optional(v.string()),
    items: v.array(
      v.object({
        partId: v.id('parts'),
        qty: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, [...COUNTER_SALE_ROLES])
    await enforce(ctx, 'financial')

    // The customer must already exist (resolved/searched by the CSR) so details
    // land in the customer table and are reused on future visits.
    const customer = await ctx.db.get(args.customerId)
    if (!customer) {
      throw new ConvexError('Customer not found. Search for or create the customer first.')
    }

    const parsed = counterSaleSchema.parse({
      paymentMethod: args.paymentMethod,
      items: args.items,
    })

    const lineItems: InvoiceLineItem[] = []
    const storedItems: Array<{
      partId: Id<'parts'>
      code: string
      description: string
      qty: number
      unitPrice: number
      lineTotal: number
    }> = []
    for (const item of parsed.items) {
      const part = await ctx.db.get(item.partId as Id<'parts'>)
      if (!part) throw new ConvexError('Part not found.')
      if (part.stockQty < item.qty) {
        throw new ConvexError(
          `Insufficient stock for ${part.code}. Available: ${part.stockQty}, requested: ${item.qty}.`,
        )
      }
      lineItems.push({
        type: 'part',
        description: `${part.code} - ${part.description}`,
        qty: item.qty,
        unitPrice: part.sellingPrice,
        lineTotal: part.sellingPrice * item.qty,
      })
      storedItems.push({
        partId: part._id,
        code: part.code,
        description: part.description,
        qty: item.qty,
        unitPrice: part.sellingPrice,
        lineTotal: part.sellingPrice * item.qty,
      })
    }

    // Deduct stock and record the outflow for every line, then snapshot the sale.
    for (const item of parsed.items) {
      const part = await ctx.db.get(item.partId as Id<'parts'>)
      if (!part) continue
      await ctx.db.patch(part._id, { stockQty: part.stockQty - item.qty })
      await ctx.db.insert('stockMovements', {
        partId: part._id,
        qty: item.qty,
        type: 'out',
        ts: Date.now(),
        userId: user._id,
      })
    }

    const settings = await ctx.db.query('settings').first()
    const totals = computeInvoiceTotals(lineItems, settings?.vatRate ?? 7.5)
    const proformaNumber = await nextDocumentNumber(ctx, 'proforma')

    const id = await ctx.db.insert('counterSales', {
      proformaNumber,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      paymentMethod: parsed.paymentMethod,
      lineItems: storedItems,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      status: 'completed',
      createdById: user._id,
      ts: Date.now(),
    })
    await audit(ctx, 'counterSale.create', 'counterSales', id)
    return id
  },
})

export const cancel = mutation({
  args: { counterSaleId: v.id('counterSales'), reason: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['admin'])
    await enforce(ctx, 'admin')
    const reason = args.reason.trim()
    if (reason.length < 10) {
      throw new ConvexError('Cancellation reason must be at least 10 characters.')
    }
    if (reason.length > 300) throw new ConvexError('Reason too long.')
    const sale = await ctx.db.get(args.counterSaleId)
    if (!sale) throw new ConvexError('Counter sale not found.')
    if (sale.status === 'cancelled') throw new ConvexError('Counter sale is already cancelled.')

    // Reverse stock that was deducted when the sale was recorded.
    for (const item of sale.lineItems) {
      const part = await ctx.db.get(item.partId)
      if (!part) continue
      await ctx.db.patch(part._id, { stockQty: part.stockQty + item.qty })
      await ctx.db.insert('stockMovements', {
        partId: part._id,
        qty: item.qty,
        type: 'in',
        ts: Date.now(),
        userId: (await requireUser(ctx))._id,
      })
    }
    await ctx.db.patch(args.counterSaleId, { status: 'cancelled' })
    await audit(
      ctx,
      `counterSale.cancel:${reason.slice(0, 80)}`,
      'counterSales',
      args.counterSaleId,
    )
    return null
  },
})
