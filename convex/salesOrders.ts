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
    const vehicle = await ctx.db.get(args.vehicleId)
    if (!vehicle) throw new ConvexError('Vehicle not found.')
    const currentQty = vehicle.stockQty ?? 1
    if (currentQty <= 0) {
      throw new ConvexError('Vehicle is out of stock.')
    }
    const parsed = createSalesOrderSchema.parse(args)
    const balance = parsed.agreedPrice - parsed.deposit
    const now = Date.now()
    const payments = parsed.deposit > 0 ? [{ amount: parsed.deposit, ts: now }] : []
    const id = await ctx.db.insert('salesOrders', {
      vehicleId: args.vehicleId,
      leadId: args.leadId,
      agreedPrice: parsed.agreedPrice,
      deposit: parsed.deposit,
      balance,
      reservedTs: now,
      status: 'pending',
      payments,
    })
    const newQty = currentQty - 1
    await ctx.db.patch(args.vehicleId, {
      stockQty: newQty,
      status: newQty === 0 ? 'reserved' : vehicle.status,
    })
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
    if (order.balance > 0) {
      throw new ConvexError('Cannot complete order until the customer has fully paid the remaining balance.')
    }
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
    const vehicle = await ctx.db.get(order.vehicleId)
    if (vehicle) {
      const newQty = (vehicle.stockQty ?? 0) + 1
      await ctx.db.patch(order.vehicleId, {
        stockQty: newQty,
        status: newQty > 0 ? 'inStock' : vehicle.status,
      })
    }
    await ctx.db.patch(args.salesOrderId, { status: 'cancelled' })
    await audit(ctx, 'salesOrder.cancel', 'salesOrders', args.salesOrderId)
  },
})


export const addPayment = mutation({
  args: {
    salesOrderId: v.id('salesOrders'),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    if (args.amount <= 0) {
      throw new ConvexError('Payment amount must be greater than 0.')
    }
    const order = await ctx.db.get(args.salesOrderId)
    if (!order) throw new ConvexError('Sales order not found.')
    if (order.status !== 'pending') {
      throw new ConvexError('Payments can only be added to pending sales orders.')
    }
    if (args.amount > order.balance) {
      throw new ConvexError('Payment amount cannot exceed remaining balance.')
    }
    const newDeposit = order.deposit + args.amount
    const newBalance = order.balance - args.amount
    const existingPayments = order.payments ?? []
    const updatedPayments = [...existingPayments, { amount: args.amount, ts: Date.now() }]

    await ctx.db.patch(args.salesOrderId, {
      deposit: newDeposit,
      balance: newBalance,
      payments: updatedPayments,
    })
    await audit(ctx, 'salesOrder.payment', 'salesOrders', args.salesOrderId)
  },
})


