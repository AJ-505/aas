import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { createPartSchema, updatePartSchema } from '../src/lib/schemas'
import { STOCK_MOVEMENT_TYPES, type StockMovementType } from '../src/lib/enums'
import { LUBRICANT_SUBCATEGORIES, normalizePartCategory } from '../src/lib/catalogue-defaults'
import { enforce, enforceDedup } from "./lib/rateLimit";

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
  args: {
    q: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const q = (args.q ?? '').trim().toLowerCase()
    const brandFilter = (args.brand ?? '').trim()
    const categoryFilter = normalizePartCategory(args.category ?? '') ?? ''
    const all = await ctx.db.query('parts').collect()
    return all.filter((p) => {
      if (brandFilter && (p.brand ?? '') !== brandFilter) return false
      if (categoryFilter) {
        const partCategory = normalizePartCategory(p.category ?? '') ?? ''
        const matchesLubricantGroup = categoryFilter === 'Lubricants' && LUBRICANT_SUBCATEGORIES.some((sub) => normalizePartCategory(sub) === partCategory)
        const matchesSpecificCategory = partCategory === categoryFilter
        if (!matchesLubricantGroup && !matchesSpecificCategory) return false
      }
      if (!q) return true
      return p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    })
  },
})

export const categories = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const all = await ctx.db.query('parts').collect()
    const set = new Set<string>()
    for (const p of all) if (p.category) set.add(p.category)
    return Array.from(set).sort()
  },
})

export const brands = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const all = await ctx.db.query('parts').collect()
    const set = new Set<string>()
    for (const p of all) if (p.brand) set.add(p.brand)
    return Array.from(set).sort()
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

function normalizeBrandCategory(v: string | undefined): string | undefined {
  if (!v) return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

function normalizeStoredPartCategory(v: string | undefined): string | undefined {
  return normalizePartCategory(v)
}

export const createPart = mutation({
  args: {
    code: v.optional(v.string()),
    partNumber: v.optional(v.string()),
    description: v.string(),
    costPrice: v.number(),
    sellingPrice: v.number(),
    stockQty: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, PARTS_MUTATION_ROLES)
    
    await enforce(ctx, "standard");const rawCode = (args.code ?? args.partNumber ?? '').trim()
    if (!rawCode) throw new Error('Part Number is required')
    const parsed = createPartSchema.parse({
      code: rawCode,
      description: args.description,
      costPrice: args.costPrice,
      sellingPrice: args.sellingPrice,
      stockQty: args.stockQty,
      reorderLevel: args.reorderLevel,
      brand: args.brand,
      category: args.category,
    })
    const id = await ctx.db.insert('parts', {
      code: parsed.code,
      description: parsed.description,
      costPrice: parsed.costPrice,
      sellingPrice: parsed.sellingPrice,
      stockQty: parsed.stockQty,
      reorderLevel: parsed.reorderLevel,
      brand: normalizeBrandCategory(parsed.brand),
      category: normalizeStoredPartCategory(parsed.category),
    })
    await audit(ctx, 'parts.create', 'parts', id)
    return id
  },
})

export const updatePart = mutation({
  args: {
    partId: v.id('parts'),
    code: v.optional(v.string()),
    partNumber: v.optional(v.string()),
    description: v.optional(v.string()),
    costPrice: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    stockQty: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, PARTS_MUTATION_ROLES)

    await enforce(ctx, "standard");const { partId, partNumber, ...patch } = args
    const normalized: Record<string, unknown> =
      partNumber !== undefined && patch.code === undefined
        ? { ...patch, code: partNumber }
        : { ...patch }
    const parsed = updatePartSchema.parse(normalized)
    const clean: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(parsed)) {
      if (val === undefined) continue
      clean[k] = k === 'category' ? normalizeStoredPartCategory(val as string) : val
    }
    if ('brand' in normalized) clean.brand = normalizeBrandCategory(normalized.brand as string | undefined)
    if ('category' in normalized) clean.category = normalizeStoredPartCategory(normalized.category as string | undefined)
    if (Object.keys(clean).length > 0) await ctx.db.patch(partId, clean)
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
    await requireActiveSession(ctx, PARTS_MUTATION_ROLES)
    
    await enforce(ctx, "standard");const part = await ctx.db.get(args.partId)
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
        code: v.optional(v.string()),
        partNumber: v.optional(v.string()),
        description: v.string(),
        costPrice: v.number(),
        sellingPrice: v.number(),
        stockQty: v.optional(v.number()),
        reorderLevel: v.optional(v.number()),
        brand: v.optional(v.string()),
        category: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, PARTS_MUTATION_ROLES)
    
    await enforce(ctx, "bulk");const inserted: string[] = []
    for (const p of args.parts) {
      const rawCode = (p.code ?? p.partNumber ?? '').trim()
      if (!rawCode) continue
      const parsed = createPartSchema.parse({
        code: rawCode,
        description: p.description,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stockQty: p.stockQty,
        reorderLevel: p.reorderLevel,
        brand: p.brand,
        category: p.category,
      })
      const id = await ctx.db.insert('parts', {
        code: parsed.code,
        description: parsed.description,
        costPrice: parsed.costPrice,
        sellingPrice: parsed.sellingPrice,
        stockQty: parsed.stockQty,
        reorderLevel: parsed.reorderLevel,
        brand: normalizeBrandCategory(parsed.brand),
        category: normalizeStoredPartCategory(parsed.category),
      })
      inserted.push(id)
    }
    if (inserted.length > 0) {
      await audit(ctx, 'parts.import', 'parts', inserted.join(','))
    }
    return { count: inserted.length }
  },
})
