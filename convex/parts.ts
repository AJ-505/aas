import { query } from './_generated/server'
import { v } from 'convex/values'
import { requireUser } from './lib/auth'

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
