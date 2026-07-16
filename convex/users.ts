import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import { requireRole, requireUser, getCurrentUser, isValidRole } from './lib/auth'
import { ROLES, type Role } from '../src/lib/enums'

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null
    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role ?? null,
      active: user.active ?? true,
    }
  },
})

export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const admin = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'admin'))
      .first()
    return admin !== null
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const users = await ctx.db.query('users').collect()
    return users.map((u) => ({
      _id: u._id,
      name: u.name ?? null,
      email: u.email ?? null,
      phone: u.phone ?? null,
      role: u.role ?? null,
      active: u.active ?? true,
    }))
  },
})

export const setRole = mutation({
  args: { userId: v.id('users'), role: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    if (!isValidRole(args.role)) {
      throw new ConvexError(`Invalid role. Expected one of: ${ROLES.join(', ')}`)
    }
    const target = await ctx.db.get(args.userId)
    if (!target) throw new ConvexError('User not found.')
    await ctx.db.patch(args.userId, { role: args.role as Role })
    await audit(ctx, 'user.setRole', 'users', args.userId)
    return null
  },
})

export const setActive = mutation({
  args: { userId: v.id('users'), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    await ctx.db.patch(args.userId, { active: args.active })
    await audit(ctx, args.active ? 'user.activate' : 'user.deactivate', 'users', args.userId)
    return null
  },
})

// One-time bootstrap: if no admin exists yet, promote the caller to admin.
// Safe because it only succeeds when zero admins are present.
export const bootstrapFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new ConvexError('You must be signed in to claim the first admin role.')
    }
    const existingAdmin = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'admin'))
      .first()
    if (existingAdmin) {
      throw new ConvexError('An admin already exists. Ask an admin to assign your role.')
    }
    await ctx.db.patch(user._id, { role: 'admin', active: true })
    await audit(ctx, 'user.bootstrapFirstAdmin', 'users', user._id)
    return { role: 'admin' as const }
  },
})

async function audit(
  ctx: MutationCtx,
  action: string,
  entity: string,
  entityId: string,
) {
  const actor = await getCurrentUser(ctx)
  if (!actor) return
  await ctx.db.insert('auditLogs', {
    userId: actor._id,
    action,
    entity,
    entityId,
    ts: Date.now(),
  })
}
