import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireRole } from './lib/auth'
import { getCurrentUser } from './lib/auth'

// Simple UA -> browser parser (best-effort, client UA is spoofable).
function parseBrowser(ua: string): string {
  const s = ua.toLowerCase()
  if (s.includes('edg/')) return 'Edge'
  if (s.includes('opr/') || s.includes('opera')) return 'Opera'
  if (s.includes('chrome/') && !s.includes('chromium')) return 'Chrome'
  if (s.includes('safari/') && !s.includes('chrome')) return 'Safari'
  if (s.includes('firefox')) return 'Firefox'
  return 'Unknown'
}

function parseDevice(ua: string): string {
  const s = ua.toLowerCase()
  if (s.includes('mobile') || s.includes('android')) return 'Mobile'
  if (s.includes('tablet') || s.includes('ipad')) return 'Tablet'
  return 'Desktop'
}

const eventValidator = v.union(
  v.literal('login'),
  v.literal('logout'),
  v.literal('login_failed'),
  v.literal('session_expired'),
  v.literal('password_reset'),
  v.literal('totp_change'),
  v.literal('totp_enabled'),
  v.literal('totp_disabled'),
)

// Any authenticated or anonymous caller may log an activity event (login_failed has no user).
// We accept client-supplied UA/screen info honestly as spoofable; server IP is not
// available inside a Convex mutation. When logging from an http action that has a
// request object, capture IP there and pass it in.
export const log = mutation({
  args: {
    event: eventValidator,
    email: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    screenInfo: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getCurrentUser(ctx)
    const ua = args.userAgent?.slice(0, 512)
    const browser = ua ? parseBrowser(ua) : undefined
    const device = ua ? parseDevice(ua) : undefined
    await ctx.db.insert('activityLogs', {
      userId: actor?._id ?? undefined,
      email: args.email?.slice(0, 256) ?? actor?.email ?? undefined,
      event: args.event,
      ts: Date.now(),
      userAgent: ua,
      browser,
      device,
      screenInfo: args.screenInfo?.slice(0, 256),
      ip: args.ip?.slice(0, 64),
    })
    return null
  },
})

// Admin-only read with filters. Audit role does NOT have access here — only admin.
export const list = query({
  args: {
    userId: v.optional(v.id('users')),
    event: v.optional(v.string()),
    fromTs: v.optional(v.number()),
    toTs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500)

    // Choose most selective index when possible
    let logs
    if (args.event) {
      logs = await ctx.db
        .query('activityLogs')
        .withIndex('by_event', (q) => q.eq('event', args.event as any))
        .order('desc')
        .take(limit * 3)
    } else if (args.userId) {
      logs = await ctx.db
        .query('activityLogs')
        .withIndex('by_user', (q) => q.eq('userId', args.userId!))
        .order('desc')
        .take(limit * 3)
    } else {
      logs = await ctx.db.query('activityLogs').withIndex('by_ts').order('desc').take(limit * 3)
    }

    let filtered = logs
    if (args.userId && args.event) {
      filtered = filtered.filter((l) => l.userId === args.userId)
    }
    if (args.fromTs !== undefined) filtered = filtered.filter((l) => l.ts >= args.fromTs!)
    if (args.toTs !== undefined) filtered = filtered.filter((l) => l.ts <= args.toTs!)
    return filtered.slice(0, limit)
  },
})
