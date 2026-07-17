import type { MutationCtx } from '../_generated/server'
import { getCurrentUser } from './auth'

export async function audit(
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
