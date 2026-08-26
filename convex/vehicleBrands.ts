import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const all = await ctx.db.query('vehicleBrands').collect()
    return all.sort((a, b) => a.name.localeCompare(b.name))
  },
})

const BRAND_MUTATION_ROLES: Array<'admin' | 'manager'> = ['admin', 'manager']

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, BRAND_MUTATION_ROLES)
    const name = args.name.trim()
    if (!name) throw new ConvexError('Brand name is required.')
    if (name.length > 60) throw new ConvexError('Brand name must be 60 characters or fewer.')
    const normalized = normalizeName(name)
    const existing = await ctx.db
      .query('vehicleBrands')
      .withIndex('by_normalizedName', (q) => q.eq('normalizedName', normalized))
      .first()
    if (existing) throw new ConvexError('A brand with this name already exists.')
    const id = await ctx.db.insert('vehicleBrands', { name, normalizedName: normalized })
    await audit(ctx, 'vehicleBrands.create', 'vehicleBrands', id)
    return id
  },
})

export const update = mutation({
  args: { brandId: v.id('vehicleBrands'), name: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, BRAND_MUTATION_ROLES)
    const name = args.name.trim()
    if (!name) throw new ConvexError('Brand name is required.')
    if (name.length > 60) throw new ConvexError('Brand name must be 60 characters or fewer.')
    const normalized = normalizeName(name)
    const existing = await ctx.db
      .query('vehicleBrands')
      .withIndex('by_normalizedName', (q) => q.eq('normalizedName', normalized))
      .first()
    if (existing && existing._id !== args.brandId) {
      throw new ConvexError('A brand with this name already exists.')
    }
    await ctx.db.patch(args.brandId, { name, normalizedName: normalized })
    await audit(ctx, 'vehicleBrands.update', 'vehicleBrands', args.brandId)
    return null
  },
})

export const remove = mutation({
  args: { brandId: v.id('vehicleBrands') },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, BRAND_MUTATION_ROLES)
    await ctx.db.delete(args.brandId)
    await audit(ctx, 'vehicleBrands.remove', 'vehicleBrands', args.brandId)
    return null
  },
})
