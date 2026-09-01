import { ConvexError } from "convex/values";
import { getCurrentUser } from "./auth";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export type RateLimitClass = "admin" | "financial" | "bulk" | "standard";

export const RATE_LIMITS: Record<RateLimitClass, { limit: number; windowMs: number }> = {
  admin: { limit: 5, windowMs: 60_000 },
  financial: { limit: 20, windowMs: 60_000 },
  bulk: { limit: 5, windowMs: 60_000 },
  standard: { limit: 60, windowMs: 60_000 },
};

export function windowStartFor(ts: number, windowMs: number): number {
  return Math.floor(ts / windowMs) * windowMs;
}

export async function isRateLimitEnabled(ctx: MutationCtx): Promise<boolean> {
  // Check settings doc kill-switch; default true if missing or field undefined
  try {
    const settings = await ctx.db.query("settings").first();
    if (settings && (settings as any).rateLimitEnabled === false) return false;
  } catch {}
  // Also allow env override via process (for tests)
  // @ts-ignore
  if (typeof process !== "undefined" && (process as any).env?.RATE_LIMIT_ENABLED === "false") return false;
  return true;
}

/**
 * Enforce rate limit for the current user. Must be called AFTER requireRole/requireActiveSession
 * so we have a stable user._id and don't burn quota on unauthenticated calls.
 * Throws ConvexError with code RATE_LIMITED on limit.
 */
export async function enforce(
  ctx: MutationCtx,
  actionClass: RateLimitClass,
  opts?: { now?: number },
): Promise<void> {
  const enabled = await isRateLimitEnabled(ctx);
  if (!enabled) return;

  const user = await getCurrentUser(ctx);
  if (!user) return; // unauth paths not rate-limited here; auth HTTP handles separately

  const { limit, windowMs } = RATE_LIMITS[actionClass];
  const now = opts?.now ?? Date.now();
  const ws = windowStartFor(now, windowMs);
  const key = `${user._id}:${actionClass}`;

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_window", (q) => q.eq("key", key).eq("windowStart", ws))
    .first();

  if (!existing) {
    await ctx.db.insert("rateLimits", { key, windowStart: ws, count: 1, actionClass });
    return;
  }

  if (existing.count >= limit) {
    const retryAfterMs = ws + windowMs - now;
    // This must run outside the rejected transaction; otherwise the thrown
    // rate-limit error rolls the observability write back as well.
    await ctx.scheduler.runAfter(0, internal.rateLimit.logEvent, {
      key,
      actionClass,
      ts: now,
      limit,
      windowMs,
      retryAfterMs,
      userId: user._id,
    });

    throw new ConvexError({
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment and try again.",
      actionClass,
      limit,
      windowMs,
      retryAfterMs,
    } as any);
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

// Dedup helper for financial double-submit (payments.record)
// Rejects second identical record within windowMs (default 60s)
export async function enforceDedup(
  ctx: MutationCtx,
  fingerprint: string,
  windowMs: number = 60_000,
  opts?: { now?: number },
): Promise<void> {
  const enabled = await isRateLimitEnabled(ctx);
  if (!enabled) return;
  const user = await getCurrentUser(ctx);
  if (!user) return;
  const now = opts?.now ?? Date.now();
  const key = `dedup:${user._id}:${fingerprint}`;
  // Query by key prefix — returns all dedup rows for this fingerprint
  const candidates = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_window", (q) => q.eq("key", key))
    .collect();
  const row = candidates[0] as any;
  if (row) {
    const last = row.windowStart as number;
    if (last !== 0 && now - last < windowMs) {
      const retryAfterMs = last + windowMs - now;
      throw new ConvexError({
        code: "DEDUP",
        message: "Duplicate request — already processed just now. Check history and try again.",
        retryAfterMs,
        fingerprint,
      } as any);
    }
    await ctx.db.patch(row._id, { windowStart: now, count: 1, actionClass: "dedup" as any });
    return;
  }
  await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1, actionClass: "dedup" } as any);
}
