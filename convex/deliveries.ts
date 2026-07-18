import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { completeDeliverySchema } from '../src/lib/schemas'

export const get = query({
  args: { deliveryId: v.id('deliveries') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.deliveryId)
  },
})

export const getBySalesOrder = query({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('deliveries')
      .withIndex('salesOrderId', (q) => q.eq('salesOrderId', args.salesOrderId))
      .first()
  },
})

export const complete = mutation({
  args: {
    salesOrderId: v.id('salesOrders'),
    checklist: v.object({
      keys: v.boolean(),
      manual: v.boolean(),
      toolkit: v.boolean(),
      inspection: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = completeDeliverySchema.parse(args)
    const user = await requireUser(ctx)
    const id = await ctx.db.insert('deliveries', {
      salesOrderId: args.salesOrderId,
      checklist: parsed.checklist,
      handedOverTs: Date.now(),
      repId: user._id,
    })
    await audit(ctx, 'delivery.complete', 'deliveries', id)
    return id
  },
})
