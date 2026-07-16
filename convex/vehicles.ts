import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { VEHICLE_STATUSES, type VehicleStatus } from '../src/lib/enums'
import { createVehicleSchema, updateVehicleSchema } from '../src/lib/schemas'

export const get = query({
  args: { vehicleId: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.vehicleId)
  },
})

export const byCustomer = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('vehicles')
      .withIndex('owner', (q) => q.eq('ownerId', args.customerId))
      .collect()
  },
})

export const byPlate = query({
  args: { plate: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const normalized = args.plate.trim().toLowerCase()
    if (!normalized) return null
    return (
      (
        await ctx.db
          .query('vehicles')
          .withIndex('by_plate', (q) => q.eq('plate', normalized))
          .first()
      ) ?? null
    )
  },
})

export const inventory = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const status = args.status as VehicleStatus | undefined
    if (status && (VEHICLE_STATUSES as readonly string[]).includes(status)) {
      return await ctx.db
        .query('vehicles')
        .withIndex('status', (q) => q.eq('status', status))
        .collect()
    }
    return await ctx.db.query('vehicles').collect()
  },
})

export const create = mutation({
  args: {
    ownerId: v.optional(v.id('customers')),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.string(),
    vin: v.optional(v.string()),
    plate: v.optional(v.string()),
    cost: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'inventoryManager', 'manager', 'admin'])
    const parsed = createVehicleSchema.parse({
      ...args,
      status: (args.status as VehicleStatus | undefined) ?? 'customerOwned',
    })
    const plate = parsed.plate && parsed.plate.length > 0 ? parsed.plate.trim().toLowerCase() : undefined
    if (plate) {
      const existing = await ctx.db
        .query('vehicles')
        .withIndex('by_plate', (q) => q.eq('plate', plate))
        .first()
      if (existing) throw new ConvexError('A vehicle with this plate already exists.')
    }
    return await ctx.db.insert('vehicles', {
      ownerId: parsed.ownerId as Id<'customers'> | undefined,
      make: parsed.make,
      model: parsed.model,
      year: parsed.year,
      color: parsed.color,
      vin: parsed.vin && parsed.vin.length > 0 ? parsed.vin : undefined,
      plate,
      cost: parsed.cost,
      sellingPrice: parsed.sellingPrice,
      status: parsed.status,
    })
  },
})

export const update = mutation({
  args: {
    vehicleId: v.id('vehicles'),
    ownerId: v.optional(v.id('customers')),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    vin: v.optional(v.string()),
    plate: v.optional(v.string()),
    cost: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'inventoryManager', 'manager', 'admin'])
    const { vehicleId, ...patch } = args
    const parsed = updateVehicleSchema.parse({
      ...patch,
      status: patch.status as VehicleStatus | undefined,
    })
    const clean: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(parsed)) {
      if (val === undefined) continue
      if (k === 'plate') {
        clean[k] = val && (val as string).length > 0 ? (val as string).trim().toLowerCase() : undefined
      } else if (typeof val === 'string' && val === '') {
        clean[k] = undefined
      } else {
        clean[k] = val
      }
    }
    await ctx.db.patch(vehicleId, clean)
    return null
  },
})
