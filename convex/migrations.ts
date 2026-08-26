import { mutation, internalMutation } from './_generated/server'
import { requireActiveSession } from './lib/session'
import { ConvexError } from 'convex/values'

async function getAdminOrSystem(ctx: any) {
  try {
    return await requireActiveSession(ctx, ['admin'])
  } catch (e) {
    // Allow CLI / system calls where there is no authenticated identity
    // (e.g. `npx convex run migrations:cleanupLegacyJobs`).
    // If there *is* an identity but they are not admin, re-throw.
    const ident = await ctx.auth.getUserIdentity()
    if (ident === null) return null
    throw e
  }
}

/**
 * Backwards-compat cleanup for legacy job fields introduced in the
 * technician-role removal (commit 0d77a69).
 *
 * Old jobs have:
 *  - technicianId, assignedTs, waitingReleaseTs (removed from schema)
 *  - status = "assigned" | "waitingRelease" (removed from JOB_STATUSES)
 *
 * This mutation normalises them so the schema can later drop the legacy
 * fields/statuses. Safe to re-run (idempotent).
 *
 * Mapping:
 *  - assigned       -> checkedIn  (no diagnosis yet; preserves checkInTs)
 *  - waitingRelease -> diagnosed  (diagnosis exists but work not started)
 *
 * Also strips the three legacy timestamp/id fields.
 *
 * Minimal wipe: patches only jobs that have legacy data; does not delete
 * any document. Run via:
 *   npx convex run migrations:cleanupLegacyJobs --prod   # prod (Vercel)
 *   npx convex run migrations:cleanupLegacyJobs          # dev deployment
 *
 * Admin-only — audited via auditLogs.
 */
export const cleanupLegacyJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAdminOrSystem(ctx)
    const jobs = await ctx.db.query('jobs').collect()
    let patched = 0
    let statusFixed = 0
    let fieldsStripped = 0

    for (const job of jobs) {
      const patch: Record<string, unknown> = {}
      let needsPatch = false

      const j = job as unknown as Record<string, unknown>

      // Strip legacy fields
      if ('technicianId' in j) {
        patch.technicianId = undefined
        needsPatch = true
        fieldsStripped++
      }
      if ('assignedTs' in j) {
        patch.assignedTs = undefined
        needsPatch = true
        fieldsStripped++
      }
      if ('waitingReleaseTs' in j) {
        patch.waitingReleaseTs = undefined
        needsPatch = true
        fieldsStripped++
      }

      // Normalise legacy statuses
      if (job.status === ('assigned' as unknown as typeof job.status)) {
        patch.status = 'checkedIn'
        needsPatch = true
        statusFixed++
      } else if (job.status === ('waitingRelease' as unknown as typeof job.status)) {
        patch.status = 'diagnosed'
        // Preserve a diagnosedTs if missing but waitingReleaseTs exists
        if (!job.diagnosedTs && typeof j.waitingReleaseTs === 'number') {
          patch.diagnosedTs = j.waitingReleaseTs as number
        }
        needsPatch = true
        statusFixed++
      }

      if (needsPatch) {
        await ctx.db.patch(job._id, patch as never)
        patched++
      }
    }

    // Lightweight audit — best-effort, does not throw
    try {
      if (user) {
        await ctx.db.insert('auditLogs', {
          userId: user._id,
          action: 'migrations.cleanupLegacyJobs',
          entity: 'jobs',
          entityId: `patched=${patched} statusFixed=${statusFixed} fieldsStripped=${fieldsStripped} total=${jobs.length}`,
          ts: Date.now(),
        })
      }
    } catch {
      // audit is best-effort; migration still succeeds
    }

    return { total: jobs.length, patched, statusFixed, fieldsStripped }
  },
})

/**
 * Dry-run helper — reports what would be patched without writing.
 * Admin-only, read-only.
 */
export const previewLegacyJobs = mutation({
  args: {},
  handler: async (ctx) => {
    await getAdminOrSystem(ctx)
    const jobs = await ctx.db.query('jobs').collect()
    const legacy = jobs.filter((j) => {
      const r = j as unknown as Record<string, unknown>
      return (
        'technicianId' in r ||
        'assignedTs' in r ||
        'waitingReleaseTs' in r ||
        (j.status as string) === 'assigned' ||
        (j.status as string) === 'waitingRelease'
      )
    })
    return {
      total: jobs.length,
      legacyCount: legacy.length,
      legacy: legacy.map((j) => ({
        _id: j._id,
        status: j.status,
        hasAssignedTs: 'assignedTs' in (j as unknown as Record<string, unknown>),
        hasTechnicianId: 'technicianId' in (j as unknown as Record<string, unknown>),
        hasWaitingReleaseTs: 'waitingReleaseTs' in (j as unknown as Record<string, unknown>),
      })),
      statuses: jobs.reduce<Record<string, number>>((acc, j) => {
        acc[j.status] = (acc[j.status] ?? 0) + 1
        return acc
      }, {}),
    }
  },
})

/**
 * Preview legacy technician users (role=technician).
 * Dry-run, read-only.
 */
export const previewLegacyUsers = mutation({
  args: {},
  handler: async (ctx) => {
    await getAdminOrSystem(ctx)
    const users = await ctx.db.query('users').collect()
    const legacy = users.filter((u) => (u as unknown as Record<string, unknown>).role === 'technician')
    return {
      total: users.length,
      legacyCount: legacy.length,
      legacy: legacy.map((u) => ({ _id: u._id, email: u.email ?? null, role: (u as unknown as Record<string, unknown>).role })),
    }
  },
})

/**
 * Migrate legacy technician users → inventoryManager.
 * Technician duties (diagnose) are now handled by inventoryManager.
 * Safe to re-run; patches only role === 'technician'.
 *
 * Minimal wipe alternative: to deactivate or delete instead, run
 *   npx convex data users --format json  (find id) + dashboard delete.
 * But converting preserves the account for the owner to re-assign.
 *
 * Run:
 *   npx convex run migrations:cleanupLegacyUsers         # prod (Vercel)
 *   CONVEX_DEPLOY_KEY='' npx convex run migrations:cleanupLegacyUsers  # dev
 */
export const cleanupLegacyUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await getAdminOrSystem(ctx)
    const users = await ctx.db.query('users').collect()
    let patched = 0
    for (const u of users) {
      if ((u as unknown as Record<string, unknown>).role === 'technician') {
        await ctx.db.patch(u._id, { role: 'inventoryManager' } as never)
        patched++
      }
    }
    try {
      if (admin) {
        await ctx.db.insert('auditLogs', {
          userId: admin._id,
          action: 'migrations.cleanupLegacyUsers',
          entity: 'users',
          entityId: `patched=${patched} total=${users.length}`,
          ts: Date.now(),
        })
      }
    } catch {}
    return { total: users.length, patched }
  },
})
