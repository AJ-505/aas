import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { warehouseSchema } from '../src/lib/schemas'
import { enforce } from './lib/rateLimit'

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const all = await ctx.db.query('warehouses').collect()
    return all.sort((a, b) => {
      if (!!a.isHeadOffice !== !!b.isHeadOffice) return a.isHeadOffice ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    isHeadOffice: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['csr', 'inventoryManager', 'admin'])
    await enforce(ctx, 'standard')
    const parsed = warehouseSchema.parse(args)
    const existing = await ctx.db
      .query('warehouses')
      .withIndex('by_name', (q) => q.eq('name', parsed.name))
      .first()
    if (existing) throw new ConvexError('A warehouse with that name already exists.')
    const id = await ctx.db.insert('warehouses', {
      name: parsed.name,
      address: parsed.address || undefined,
      isHeadOffice: parsed.isHeadOffice,
    })
    await audit(ctx, 'warehouse.create', 'warehouses', id)
    return id
  },
})
