import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import type { QueryCtx, MutationCtx } from '../_generated/server'
import { type Role } from '../../src/lib/enums'
import { isAuthorized, isValidRole } from '../../src/lib/auth-utils'

export { isValidRole }

export function normalizeEmailForAuth(email?: string | null): string | undefined {
  const normalized = email?.trim().toLowerCase()
  return normalized && normalized.length > 0 ? normalized : undefined
}

export async function findPasswordAuthAccountForUser(
  ctx: MutationCtx,
  userId: string,
  email?: string | null,
) {
  const normalizedEmail = normalizeEmailForAuth(email)
  const accounts = await ctx.db
    .query('authAccounts')
    .filter((q) => q.eq(q.field('provider'), 'password') && q.eq(q.field('userId'), userId))
    .collect()

  const candidate =
    accounts.find((account: any) => normalizeEmailForAuth(account.providerAccountId) === normalizedEmail) ??
    accounts[0]

  if (!candidate) return null

  const providerAccountId = normalizeEmailForAuth((candidate as any).providerAccountId) ?? normalizedEmail
  if (providerAccountId && providerAccountId !== (candidate as any).providerAccountId) {
    await ctx.db.patch((candidate as any)._id, { providerAccountId } as any)
  }

  return { account: candidate, providerAccountId }
}

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
