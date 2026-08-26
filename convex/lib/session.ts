import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { getCurrentUser, requireUser, requireRole } from "./auth";
import type { Role } from "../../src/lib/enums";

export const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
export const WARNING_MS = 25 * 60 * 1000; // warning at 25 min
export const HEARTBEAT_THROTTLE_MS = 50_000; // server early-return if <50s

export async function heartbeat(ctx: MutationCtx): Promise<number> {
  const user = await requireUser(ctx);
  const now = Date.now();
  // throttle server writes: if lastActiveTs is very recent, skip patch
  const last = (user as any).lastActiveTs as number | undefined;
  if (last && now - last < HEARTBEAT_THROTTLE_MS) {
    return last;
  }
  await ctx.db.patch(user._id, { lastActiveTs: now } as any);
  return now;
}

/**
 * Wrapper for write mutations: enforces role + inactivity + 2FA verification.
 * Reads should use `requireRole` or `requireUser` directly so they don't
 * force a heartbeat loop (warning modal needs reads to succeed).
 *
 * Throws ConvexError with user-safe messages (no secrets).
 */
export async function requireActiveSession(
  ctx: QueryCtx | MutationCtx,
  roles: Role[],
) {
  const user = await requireRole(ctx, roles);
  const now = Date.now();

  // Inactivity check
  const lastActive = (user as any).lastActiveTs as number | undefined;
  // If never set, treat as now (fresh login) — heartbeat will set it shortly.
  // Only enforce after first heartbeat: allow 30min grace from _creationTime if missing
  if (lastActive !== undefined) {
    if (now - lastActive > INACTIVITY_MS) {
      throw new ConvexError("Session expired due to inactivity. Please sign in again.");
    }
  } else {
    // No lastActiveTs yet — use session creation as proxy: allow, but prime it lazily
    // (actual heartbeat will set it; no throw here to avoid blocking first action)
  }

  // 2FA gate: if enabled, require recent verification
  const totpEnabled = (user as any).totpEnabled as boolean | undefined;
  if (totpEnabled) {
    const lastVerified = (user as any).lastTotpVerifiedTs as number | undefined;
    if (!lastVerified || now - lastVerified > INACTIVITY_MS) {
      throw new ConvexError("Two-factor verification required. Please verify with your authenticator app.");
    }
  }

  return user;
}

/**
 * Lightweight check for `users.me` gating: returns flags without throwing
 * on inactive, so client can show expired banner before force signOut.
 */
export async function sessionFlags(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) return null;
  const now = Date.now();
  const lastActive = (user as any).lastActiveTs as number | undefined;
  const totpEnabled = (user as any).totpEnabled as boolean | undefined;
  const lastVerified = (user as any).lastTotpVerifiedTs as number | undefined;
  const inactiveExpired = lastActive !== undefined && now - lastActive > INACTIVITY_MS;
  const totpExpired = !!totpEnabled && (!lastVerified || now - lastVerified > INACTIVITY_MS);
  return {
    inactiveExpired,
    totpExpired,
    needsTotpVerify: totpExpired,
    mustChangePassword: !!(user as any).mustChangePassword,
  };
}
