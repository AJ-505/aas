import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { createSalesOrderSchema } from '../src/lib/schemas'

export const get = query({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.salesOrderId)
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db.query('salesOrders').order('desc').take(100)
  },
})

export const byVehicle = query({
  args: { vehicleId: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('salesOrders')
      .withIndex('vehicleId', (q) => q.eq('vehicleId', args.vehicleId))
      .first()
  },
})

export const byLead = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('salesOrders')
      .withIndex('leadId', (q) => q.eq('leadId', args.leadId))
      .first()
  },
})

export const create = mutation({
  args: {
    vehicleId: v.id('vehicles'),
    leadId: v.id('leads'),
    agreedPrice: v.number(),
    deposit: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = createSalesOrderSchema.parse(args)
    const balance = parsed.agreedPrice - parsed.deposit
    const id = await ctx.db.insert('salesOrders', {
      vehicleId: args.vehicleId,
      leadId: args.leadId,
      agreedPrice: parsed.agreedPrice,
      deposit: parsed.deposit,
      balance,
      reservedTs: Date.now(),
      status: 'pending',
    })
    await ctx.db.patch(args.vehicleId, { status: 'reserved' })
    await audit(ctx, 'salesOrder.create', 'salesOrders', id)
    return id
  },
})

export const complete = mutation({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const order = await ctx.db.get(args.salesOrderId)
    if (!order) throw new ConvexError('Sales order not found.')
    await ctx.db.patch(args.salesOrderId, { status: 'completed' })
    await ctx.db.patch(order.vehicleId, { status: 'sold' })
    await audit(ctx, 'salesOrder.complete', 'salesOrders', args.salesOrderId)
  },
})

export const cancel = mutation({
  args: { salesOrderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const order = await ctx.db.get(args.salesOrderId)
    if (!order) throw new ConvexError('Sales order not found.')
    await ctx.db.patch(args.salesOrderId, { status: 'cancelled' })
    await ctx.db.patch(order.vehicleId, { status: 'inStock' })
    await audit(ctx, 'salesOrder.cancel', 'salesOrders', args.salesOrderId)
  },
})
