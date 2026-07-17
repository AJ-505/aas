import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { labourTypeSchema } from '../src/lib/schemas'

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db.query('labourTypes').collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    fixedPrice: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const parsed = labourTypeSchema.parse(args)
    const id = await ctx.db.insert('labourTypes', {
      name: parsed.name,
      fixedPrice: parsed.fixedPrice,
    })
    await audit(ctx, 'labourType.create', 'labourTypes', id)
    return id
  },
})

export const update = mutation({
  args: {
    labourTypeId: v.id('labourTypes'),
    name: v.optional(v.string()),
    fixedPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const { labourTypeId, ...patch } = args
    const clean: Record<string, unknown> = {}
    if (patch.name !== undefined) clean.name = patch.name
    if (patch.fixedPrice !== undefined) clean.fixedPrice = patch.fixedPrice
    await ctx.db.patch(labourTypeId, clean)
    await audit(ctx, 'labourType.update', 'labourTypes', labourTypeId)
    return null
  },
})

export const remove = mutation({
  args: { labourTypeId: v.id('labourTypes') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const existing = await ctx.db.get(args.labourTypeId)
    if (!existing) throw new ConvexError('Labour type not found.')
    await ctx.db.delete(args.labourTypeId)
    await audit(ctx, 'labourType.remove', 'labourTypes', args.labourTypeId)
    return null
  },
})
