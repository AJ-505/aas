import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { invoiceSettingsSchema } from '../src/lib/schemas/invoice'

export const get = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const settings = await ctx.db.query('settings').first()
    return {
      vatRate: settings?.vatRate ?? 7.5,
    }
  },
})

export const setVatRate = mutation({
  args: { vatRate: v.number() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const parsed = invoiceSettingsSchema.parse(args)
    const existing = await ctx.db.query('settings').first()
    if (existing) {
      await ctx.db.patch(existing._id, { vatRate: parsed.vatRate })
      await audit(ctx, 'settings.setVatRate', 'settings', existing._id)
      return existing._id
    }
    const id = await ctx.db.insert('settings', { vatRate: parsed.vatRate })
    await audit(ctx, 'settings.setVatRate', 'settings', id)
    return id
  },
})
