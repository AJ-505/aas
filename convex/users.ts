import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  requireRole,
  requireUser,
  getCurrentUser,
  isValidRole,
  normalizeEmailForAuth,
  findPasswordAuthAccountForUser,
} from "./lib/auth";
import { audit } from "./lib/audit";
import { heartbeat as sessionHeartbeat } from "./lib/session";
import { ROLES, type Role } from "../src/lib/enums";
import { enforce, enforceDedup } from "./lib/rateLimit";
import { Scrypt } from "lucia";
import { getAuthSessionId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const u = user as any;
    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role ?? null,
      active: user.active ?? true,
      // security flags
      totpEnabled: !!u.totpEnabled,
      hasTotpSecret: !!u.totpSecret,
      mustChangePassword: !!u.mustChangePassword,
      lastActiveTs: (u.lastActiveTs as number | undefined) ?? null,
      lastTotpVerifiedTs: (u.lastTotpVerifiedTs as number | undefined) ?? null,
    };
  },
});

export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();
    return admin !== null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Audit role has read-only access to user directory (needed for audit filters).
    await requireRole(ctx, ['admin', 'audit'])
    const users = await ctx.db.query("users").collect();
    return users.map((u) => {
      const uu = u as any;
      return {
        _id: u._id,
        name: u.name ?? null,
        email: u.email ?? null,
        phone: u.phone ?? null,
        role: u.role ?? null,
        active: u.active ?? true,
        totpEnabled: !!uu.totpEnabled,
        mustChangePassword: !!uu.mustChangePassword,
      };
    });
  },
});

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const ts = await sessionHeartbeat(ctx);
    return { ts };
  },
});

export const setRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await enforce(ctx, "admin");
    if (!isValidRole(args.role)) {
      throw new ConvexError(`Invalid role. Expected one of: ${ROLES.join(", ")}`);
    }
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found.");
    await ctx.db.patch(args.userId, { role: args.role as Role });
    await audit(ctx, "user.setRole", "users", args.userId);
    return null;
  },
});

export const setActive = mutation({
  args: { userId: v.id("users"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await enforce(ctx, "admin");
    await ctx.db.patch(args.userId, { active: args.active });
    await audit(ctx, args.active ? "user.activate" : "user.deactivate", "users", args.userId);
    return null;
  },
});

// One-time bootstrap: if no admin exists yet, promote the caller to admin.
// Safe because it only succeeds when zero admins are present.
export const bootstrapFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError("You must be signed in to claim the first admin role.");
    }
    await enforce(ctx, "admin");
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();
    if (existingAdmin) {
      throw new ConvexError("An admin already exists. Ask an admin to assign your role.");
    }
    await ctx.db.patch(user._id, { role: "admin", active: true });
    await audit(ctx, "user.bootstrapFirstAdmin", "users", user._id);
    return { role: "admin" as const };
  },
});

/**
 * Admin password reset: sets a temporary password and forces change on next login.
 * Never logs the password. Hashes with Scrypt (same as Convex Auth Password
 * provider) and patches `authAccounts.secret` directly. This works inside a
 * Convex mutation context, unlike `modifyAccountCredentials`/`retrieveAccount`
 * which require an ActionCtx (ctx.runMutation) and therefore always threw
 * here, falling back to an unverifiable SHA-256 hash that broke login.
 */
export const adminResetPassword = mutation({
  args: { userId: v.id("users"), tempPassword: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await enforce(ctx, "admin");
    const resolvedTempPassword = args.tempPassword.trim();
    if (resolvedTempPassword.length < 8) throw new ConvexError("Temporary password must be at least 8 characters.");
    if (resolvedTempPassword.length > 128) throw new ConvexError("Temporary password too long (max 128).");
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found.");
    const email = normalizeEmailForAuth((target as any).email as string | undefined);
    if (!email) throw new ConvexError("Target user has no valid email; cannot reset password.");

    const record: any = await findPasswordAuthAccountForUser(ctx, args.userId, email);
    if (!record) throw new ConvexError("Target user has no password account; cannot reset password.");
    const authAccount: any = record.account ?? record;

    const hashed = await new Scrypt().hash(resolvedTempPassword);
    await ctx.db.patch(authAccount._id as any, { secret: hashed } as any);

    // Invalidate all existing sessions for the target user so they must re-login
    // with the temporary password. Best-effort: ignore if authSessions not indexed.
    try {
      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", args.userId))
        .collect();
      for (const s of sessions) {
        await ctx.db.delete(s._id);
      }
    } catch {
      // if index missing or table unavailable, continue without invalidation
    }

    await ctx.db.patch(args.userId, { mustChangePassword: true, lastActiveTs: Date.now() } as any);
    await audit(ctx, "user.adminResetPassword", "users", args.userId);
    return null;
  },
});

/**
 * User-initiated password change. If mustChangePassword is true, old password
 * check is bypassed (admin-issued temp); otherwise require verification via
 * Scrypt. Hashes the new password with Scrypt directly in the mutation
 * context (same fix as adminResetPassword).
 */
export const changePassword = mutation({
  args: { currentPassword: v.optional(v.string()), newPassword: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "admin");
    if (args.newPassword.length < 8) throw new ConvexError("New password must be at least 8 characters.");
    if (args.newPassword.length > 128) throw new ConvexError("New password too long (max 128).");
    const mustChange = !!(user as any).mustChangePassword;
    const email = normalizeEmailForAuth((user as any).email as string | undefined);
    if (!email) throw new ConvexError("No valid email on account; cannot change password.");

    const record: any = await findPasswordAuthAccountForUser(ctx, user._id, email);
    if (!record) throw new ConvexError("No password account found; cannot change password.");
    const authAccount: any = record.account ?? record;

    if (!mustChange) {
      const cur = (args.currentPassword ?? "").trim();
      if (!cur) throw new ConvexError("Current password is required.");
      const secret = (authAccount as any).secret as string | undefined;
      if (!secret) throw new ConvexError("Unable to verify current password.");
      const ok = await new Scrypt().verify(secret, cur);
      if (!ok) throw new ConvexError("Current password is incorrect.");
    }

    const hashed = await new Scrypt().hash(args.newPassword);
    await ctx.db.patch(authAccount._id as any, { secret: hashed } as any);

    // Keep current session alive; invalidate other sessions for this user
    try {
      const curSessionId: any = await (getAuthSessionId as any)(ctx);
      const allSessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect();
      for (const s of allSessions) {
        if (curSessionId && s._id === curSessionId) continue;
        await ctx.db.delete(s._id);
      }
    } catch {
      // best-effort: leave sessions intact if we cannot determine current session
    }

    await ctx.db.patch(user._id, { mustChangePassword: false, lastActiveTs: Date.now() } as any);
    try { await ctx.db.patch(user._id, { mustChangePassword: undefined } as any); } catch {}
    await audit(ctx, "user.changePassword", "users", user._id);
    return null;
  },
});

export const normalizeLegacyPasswordAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin']);
    const rows = await ctx.db.query('authAccounts').filter((q) => q.eq(q.field('provider'), 'password')).collect();
    let count = 0;
    for (const row of rows) {
      const providerAccountId = normalizeEmailForAuth((row as any).providerAccountId);
      if (!providerAccountId || providerAccountId === (row as any).providerAccountId) continue;
      await ctx.db.patch((row as any)._id, { providerAccountId } as any);
      count += 1;
    }
    return { updated: count };
  },
});

export const clearMustChangePassword = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "standard");
    await ctx.db.patch(user._id, { mustChangePassword: undefined } as any);
    return null;
  },
});
