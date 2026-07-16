import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../src/lib/schemas'

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const q = args.q.trim()
    if (!q) {
      return await ctx.db.query('customers').order('desc').take(50)
    }
    const byName = await ctx.db
      .query('customers')
      .withSearchIndex('name', (s) => s.search('name', q))
      .take(20)
    const byPhone = await ctx.db
      .query('customers')
      .withSearchIndex('search_phone', (s) => s.search('phone', q))
      .take(20)
    const seen = new Set<string>()
    const merged = []
    for (const c of [...byName, ...byPhone]) {
      if (!seen.has(c._id)) {
        seen.add(c._id)
        merged.push(c)
      }
    }
    return merged
  },
})

export const get = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.customerId)
  },
})

export const getWithVehicles = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const customer = await ctx.db.get(args.customerId)
    if (!customer) throw new ConvexError('Customer not found.')
    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('owner', (q) => q.eq('ownerId', args.customerId))
      .collect()
    return { customer, vehicles }
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = createCustomerSchema.parse(args)
    const id = await ctx.db.insert('customers', {
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email && parsed.email.length > 0 ? parsed.email : undefined,
      address: parsed.address && parsed.address.length > 0 ? parsed.address : undefined,
    })
    return id
  },
})

export const update = mutation({
  args: {
    customerId: v.id('customers'),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const { customerId, ...patch } = args
    const parsed = updateCustomerSchema.parse(patch)
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== undefined) clean[k] = v === '' ? undefined : v
    }
    await ctx.db.patch(customerId, clean)
    return null
  },
})
