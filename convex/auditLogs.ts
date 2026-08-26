import { query } from './_generated/server'
import { v } from 'convex/values'
import { requireRole } from './lib/auth'

// Admin-only audit log listing with filters. Used by /admin/audit UI.
// Audit role purposely excluded: audit trail is admin-only per spec ("Admin audit-log UI").
export const list = query({
  args: {
    userId: v.optional(v.id('users')),
    action: v.optional(v.string()),
    entity: v.optional(v.string()),
    fromTs: v.optional(v.number()),
    toTs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500)
    let logs
    if (args.userId) {
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_user', (q) => q.eq('userId', args.userId!))
        .order('desc')
        .take(limit * 3)
    } else {
      logs = await ctx.db.query('auditLogs').withIndex('by_ts').order('desc').take(limit * 3)
    }
    let filtered = logs
    if (args.action) filtered = filtered.filter((l) => l.action === args.action)
    if (args.entity) filtered = filtered.filter((l) => l.entity === args.entity)
    if (args.fromTs !== undefined) filtered = filtered.filter((l) => l.ts >= args.fromTs!)
    if (args.toTs !== undefined) filtered = filtered.filter((l) => l.ts <= args.toTs!)
    return filtered.slice(0, limit)
  },
})

export const distinctActions = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const logs = await ctx.db.query('auditLogs').withIndex('by_ts').order('desc').take(500)
    return [...new Set(logs.map((l) => l.action))].sort()
  },
})
