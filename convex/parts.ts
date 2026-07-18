import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { createPartSchema, updatePartSchema } from '../src/lib/schemas'
import { STOCK_MOVEMENT_TYPES, type StockMovementType } from '../src/lib/enums'

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db.query('parts').collect()
  },
})

export const get = query({
  args: { partId: v.id('parts') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.partId)
  },
})

export const lowStock = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const all = await ctx.db.query('parts').collect()
    return all.filter((p) => p.stockQty <= p.reorderLevel)
  },
})

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const q = args.q.trim().toLowerCase()
    if (!q) {
      return await ctx.db.query('parts').order('desc').take(50)
    }
    const all = await ctx.db.query('parts').collect()
    return all.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  },
})

export const movements = query({
  args: { partId: v.id('parts') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('stockMovements')
      .withIndex('partId', (q) => q.eq('partId', args.partId))
      .order('desc')
      .take(100)
  },
})

const PARTS_MUTATION_ROLES: Array<'inventoryManager' | 'manager' | 'admin'> = ['inventoryManager', 'manager', 'admin']

export const createPart = mutation({
  args: {
    code: v.string(),
    description: v.string(),
    costPrice: v.number(),
    sellingPrice: v.number(),
    stockQty: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, PARTS_MUTATION_ROLES)
    const parsed = createPartSchema.parse(args)
    const id = await ctx.db.insert('parts', {
      code: parsed.code,
      description: parsed.description,
      costPrice: parsed.costPrice,
      sellingPrice: parsed.sellingPrice,
      stockQty: parsed.stockQty,
      reorderLevel: parsed.reorderLevel,
    })
    await audit(ctx, 'parts.create', 'parts', id)
    return id
  },
})

export const updatePart = mutation({
  args: {
    partId: v.id('parts'),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    costPrice: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    stockQty: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, PARTS_MUTATION_ROLES)
    const { partId, ...patch } = args
    const parsed = updatePartSchema.parse(patch)
    const clean: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(parsed)) {
      if (val !== undefined) clean[k] = val
    }
    await ctx.db.patch(partId, clean)
    await audit(ctx, 'parts.update', 'parts', partId)
    return null
  },
})

export const adjustStock = mutation({
  args: {
    partId: v.id('parts'),
    qty: v.number(),
    type: v.union(...STOCK_MOVEMENT_TYPES.map((t) => v.literal(t))),
    jobId: v.optional(v.id('jobs')),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, PARTS_MUTATION_ROLES)
    const part = await ctx.db.get(args.partId)
    if (!part) throw new Error('Part not found')

    let newQty = part.stockQty
    if (args.type === 'in') {
      newQty += args.qty
    } else if (args.type === 'out') {
      if (part.stockQty < args.qty) {
        throw new Error('Insufficient stock')
      }
      newQty -= args.qty
    } else {
      // 'adjust' — set absolute
      newQty = args.qty
    }

    await ctx.db.patch(args.partId, { stockQty: newQty })
    await ctx.db.insert('stockMovements', {
      partId: args.partId,
      qty: args.qty,
      type: args.type as StockMovementType,
      jobId: args.jobId,
      ts: Date.now(),
      userId: (await requireUser(ctx))._id,
    })
    await audit(
      ctx,
      `stock.${args.type}`,
      'parts',
      args.partId,
    )
    return { stockQty: newQty }
  },
})

export const importParts = mutation({
  args: {
    parts: v.array(
      v.object({
        code: v.string(),
        description: v.string(),
        costPrice: v.number(),
        sellingPrice: v.number(),
        stockQty: v.optional(v.number()),
        reorderLevel: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, PARTS_MUTATION_ROLES)
    const inserted: string[] = []
    for (const p of args.parts) {
      const parsed = createPartSchema.parse(p)
      const id = await ctx.db.insert('parts', {
        code: parsed.code,
        description: parsed.description,
        costPrice: parsed.costPrice,
        sellingPrice: parsed.sellingPrice,
        stockQty: parsed.stockQty,
        reorderLevel: parsed.reorderLevel,
      })
      inserted.push(id)
    }
    if (inserted.length > 0) {
      await audit(ctx, 'parts.import', 'parts', inserted.join(','))
    }
    return { count: inserted.length }
  },
})
