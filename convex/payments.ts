import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { recordPaymentSchema } from '../src/lib/schemas/invoice'

export const byInvoice = query({
  args: { invoiceId: v.id('invoices') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('payments')
      .withIndex('invoiceId', (q) => q.eq('invoiceId', args.invoiceId))
      .collect()
  },
})

export const record = mutation({
  args: {
    invoiceId: v.id('invoices'),
    amount: v.number(),
    method: v.union(v.literal("cash"), v.literal("transfer"), v.literal("card"), v.literal("pos"), v.literal("bank")),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['finance', 'manager', 'admin'])
    const parsed = recordPaymentSchema.parse(args)
    const invoice = await ctx.db.get(parsed.invoiceId as Id<'invoices'>)
    if (!invoice) throw new ConvexError('Invoice not found.')
    if ((invoice as any).kind === 'estimate') throw new ConvexError('Cannot record payments against an estimate.')
    if (!invoice.approved) throw new ConvexError('Invoice must be approved before recording payments.')
    if ((invoice as any).locked && invoice.paid) throw new ConvexError('Invoice is locked and already paid.')
    // cap beyond balance
    const remaining = invoice.grandTotal - invoice.amountPaid
    if (parsed.amount > remaining) {
      throw new ConvexError(`Payment amount exceeds remaining balance (${remaining} kobo).`)
    }
    if (parsed.amount <= 0) throw new ConvexError('Payment amount must be greater than 0.')

    const paymentId = await ctx.db.insert('payments', {
      invoiceId: parsed.invoiceId as Id<'invoices'>,
      amount: parsed.amount,
      method: parsed.method,
      ts: Date.now(),
      recordedById: user._id,
    })

    // Update amountPaid on invoice
    const newAmountPaid = invoice.amountPaid + parsed.amount
    await ctx.db.patch(parsed.invoiceId as Id<'invoices'>, {
      amountPaid: newAmountPaid,
      paid: newAmountPaid >= invoice.grandTotal,
    })

    await audit(ctx, 'payment.record', 'payments', paymentId)
    return paymentId
  },
})
