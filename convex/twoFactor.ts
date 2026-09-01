import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUser, requireUser, requireRole } from "./lib/auth";
import { audit } from "./lib/audit";
import {
  generateSecret,
  generateBackupCodes,
  buildOtpauthUri,
  totpVerify,
} from "./lib/totp";
import { enforce, enforceDedup } from "./lib/rateLimit";

export const status = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return {
      totpEnabled: !!(user as any).totpEnabled,
      hasSecret: !!(user as any).totpSecret,
      backupCodesCount: ((user as any).backupCodes as string[] | undefined)?.length ?? 0,
      lastTotpVerifiedTs: (user as any).lastTotpVerifiedTs ?? null,
    };
  },
});

export const setup = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "admin");
    // Allow initial setup when the account was defaulted to enabled but no secret has been enrolled yet.
    const existingSecret = (user as any).totpSecret as string | undefined;
    if ((user as any).totpEnabled && existingSecret) {
      throw new ConvexError("Two-factor is already enabled. Disable it first to re-enroll.");
    }
    const secret = generateSecret();
    const email = (user.email ?? user._id) as string;
    const uri = buildOtpauthUri(secret, email);
    await ctx.db.patch(user._id, { totpSecret: secret } as any);
    // Not yet enabled until verifySetup succeeds; audit setup initiation
    await audit(ctx, "2fa.setup", "users", user._id);
    return { secret, uri };
  },
});

export const verifySetup = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "standard");
    const secret = (user as any).totpSecret as string | undefined;
    if (!secret) throw new ConvexError("No pending 2FA setup. Call setup first.");
    if ((user as any).totpEnabled && !!(user as any).totpSecret) {
      throw new ConvexError("Two-factor is already enabled.");
    }
    const code = args.code.trim();
    if (!totpVerify(secret, code)) {
      throw new ConvexError("Invalid verification code. Check your authenticator and try again.");
    }
    const backupCodes = generateBackupCodes(10);
    const now = Date.now();
    await ctx.db.patch(user._id, {
      totpEnabled: true,
      backupCodes,
      lastTotpVerifiedTs: now,
      lastActiveTs: now,
    } as any);
    await audit(ctx, "2fa.enabled", "users", user._id);
    return { backupCodes };
  },
});

export const verifyLogin = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "standard");
    if (!(user as any).totpEnabled) {
      throw new ConvexError("Two-factor is not enabled for this account.");
    }
    const secret = (user as any).totpSecret as string | undefined;
    if (!secret) throw new ConvexError("2FA secret missing. Please re-enroll.");
    const raw = args.code.trim().replace(/\s|-/g, "");
    const backupCodes = ((user as any).backupCodes as string[] | undefined) ?? [];
    // Backup code path: single-use, case-insensitive? store as uppercase, compare uppercase
    const upper = raw.toUpperCase();
    const idx = backupCodes.findIndex((c) => c.toUpperCase() === upper);
    if (idx !== -1) {
      // Consume backup code
      const remaining = backupCodes.filter((_, i) => i !== idx);
      const now = Date.now();
      await ctx.db.patch(user._id, {
        backupCodes: remaining,
        lastTotpVerifiedTs: now,
        lastActiveTs: now,
      } as any);
      await audit(ctx, "2fa.backupUsed", "users", user._id);
      return { method: "backup", remainingCount: remaining.length };
    }
    // TOTP path
    if (!totpVerify(secret, raw)) {
      throw new ConvexError("Invalid code. Try again.");
    }
    const now = Date.now();
    await ctx.db.patch(user._id, {
      lastTotpVerifiedTs: now,
      lastActiveTs: now,
    } as any);
    await audit(ctx, "2fa.verified", "users", user._id);
    return { method: "totp" as const };
  },
});

export const disable = mutation({
  args: { code: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "admin");
    if (!(user as any).totpEnabled) throw new ConvexError("Two-factor is not enabled.");
    // Require current code to disable (prevents session hijack from disabling)
    const secret = (user as any).totpSecret as string | undefined;
    if (!secret) throw new ConvexError("Secret missing.");
    const backupCodes = ((user as any).backupCodes as string[] | undefined) ?? [];
    const raw = (args.code ?? "").trim().replace(/\s|-/g, "");
    let ok = false;
    if (raw) {
      const upper = raw.toUpperCase();
      if (backupCodes.some((c) => c.toUpperCase() === upper)) ok = true;
      if (totpVerify(secret, raw)) ok = true;
    }
    if (!ok) throw new ConvexError("Verification required to disable 2FA. Provide a valid code or backup code.");
    await ctx.db.patch(user._id, {
      totpSecret: undefined,
      totpEnabled: false,
      backupCodes: undefined,
      lastTotpVerifiedTs: undefined,
    } as any);
    // Clear optional fields via undefined patch fallback: do explicit delete via second patch if needed
    try { await ctx.db.patch(user._id, { totpSecret: undefined } as any); } catch {}
    try { await ctx.db.patch(user._id, { backupCodes: undefined } as any); } catch {}
    await audit(ctx, "2fa.disabled", "users", user._id);
    return null;
  },
});

export const regenerateBackupCodes = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await enforce(ctx, "admin");
    if (!(user as any).totpEnabled) throw new ConvexError("Two-factor is not enabled.");
    const secret = (user as any).totpSecret as string | undefined;
    if (!secret) throw new ConvexError("Secret missing.");
    if (!totpVerify(secret, args.code.trim())) {
      throw new ConvexError("Invalid code. Cannot regenerate backup codes.");
    }
    const newCodes = generateBackupCodes(10);
    await ctx.db.patch(user._id, { backupCodes: newCodes } as any);
    await audit(ctx, "2fa.backupRegenerated", "users", user._id);
    return { backupCodes: newCodes };
  },
});

export const adminReset = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await enforce(ctx, "admin");
    const target = await ctx.db.get(args.userId);
    if (!target) throw new ConvexError("User not found.");

    // Resetting 2FA should force re-enrollment, not disable enforcement.
    // Keep the account in the "enabled but unconfigured" state so the app
    // redirects the user back to the security page until they set it up again.
    await ctx.db.patch(args.userId, {
      totpSecret: undefined,
      totpEnabled: true,
      backupCodes: undefined,
      lastTotpVerifiedTs: undefined,
    } as any);
    try { await ctx.db.patch(args.userId, { totpSecret: undefined } as any); } catch {}
    try { await ctx.db.patch(args.userId, { backupCodes: undefined } as any); } catch {}
    await audit(ctx, "2fa.adminReset", "users", args.userId);
    return null;
  },
});
