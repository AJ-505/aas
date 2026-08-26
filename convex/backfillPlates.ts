import { mutation } from './_generated/server'
import { requireRole } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { enforce, enforceDedup } from "./lib/rateLimit";

const PLATE_REGEX = /^[A-Z0-9][A-Z0-9 -]{2,}$/

function normalizePlate(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const t = raw.trim()
  if (!t) return undefined
  return t.toUpperCase()
}

/**
 * Idempotent backfill: uppercases vehicles.plate and appointments.vehiclePlate.
 * Not run automatically; invoke manually via `bunx convex run backfillPlates:backfillPlates`.
 * Safe to run multiple times.
 */
export const backfillPlates = mutation({
  args: {},
  handler: async (ctx) => {
    await requireActiveSession(ctx, ['admin', 'manager'])
    
    await enforce(ctx, "admin");let vehicleUpdated = 0
    let vehicleSkipped = 0
    let appointmentUpdated = 0
    let appointmentSkipped = 0
    let totalVehicles = 0
    let totalAppointments = 0

    // Paginated iteration to avoid OOM/collect limits on large tables.
    // Convex recommends cursor-based pagination for backfills.
    const PAGE = 200
    let cursor: string | null = null
    while (true) {
      const page = await ctx.db.query('vehicles').paginate({ cursor, numItems: PAGE })
      totalVehicles += page.page.length
      for (const v of page.page) {
        if (!v.plate) {
          vehicleSkipped++
          continue
        }
        const normalized = normalizePlate(v.plate)
        if (!normalized) {
          vehicleSkipped++
          continue
        }
        // Always normalize to uppercase for canonical lookup, even if regex fails afterwards
        if (v.plate !== normalized) {
          await ctx.db.patch(v._id, { plate: normalized })
          vehicleUpdated++
        } else {
          vehicleSkipped++
        }
      }
      if (page.isDone) break
      cursor = page.continueCursor
    }

    cursor = null
    while (true) {
      const page = await ctx.db.query('appointments').paginate({ cursor, numItems: PAGE })
      totalAppointments += page.page.length
      for (const a of page.page) {
        if (!a.vehiclePlate) {
          appointmentSkipped++
          continue
        }
        const normalized = normalizePlate(a.vehiclePlate)
        if (!normalized) {
          appointmentSkipped++
          continue
        }
        if (a.vehiclePlate !== normalized) {
          await ctx.db.patch(a._id, { vehiclePlate: normalized })
          appointmentUpdated++
        } else {
          appointmentSkipped++
        }
      }
      if (page.isDone) break
      cursor = page.continueCursor
    }

    await audit(ctx, 'backfill.plates', 'system', `vehicles:${vehicleUpdated}+appointments:${appointmentUpdated}`)

    return {
      vehicleUpdated,
      vehicleSkipped,
      appointmentUpdated,
      appointmentSkipped,
      totalVehicles,
      totalAppointments,
    }
  },
})
