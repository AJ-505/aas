import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import type { QueryCtx, MutationCtx } from '../_generated/server'
import { type Role } from '../../src/lib/enums'
import { isAuthorized, isValidRole } from '../../src/lib/auth-utils'

export { isValidRole }

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) return null
  const user = await ctx.db.get(userId)
  if (!user) return null
  if (user.active === false) return null
  return user
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx)
  if (!user) {
    throw new ConvexError('You must be signed in to perform this action.')
  }
  return user
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  roles: Role[],
) {
  const user = await requireUser(ctx)
  if (!isAuthorized(user.role, roles)) {
    throw new ConvexError('You are not authorized to perform this action.')
  }
  return user
}
