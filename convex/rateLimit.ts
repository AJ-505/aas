import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/auth";
import { ConvexError } from "convex/values";

export const listEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "manager", "audit"]);
    const take = Math.min(args.limit ?? 50, 200);
    return await ctx.db.query("rateLimitEvents").withIndex("by_ts").order("desc").take(take);
  },
});

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return {
      enabled: (settings as any)?.rateLimitEnabled !== false,
      limits: {
        admin: { limit: 5, windowMs: 60_000 },
        financial: { limit: 20, windowMs: 60_000 },
        bulk: { limit: 5, windowMs: 60_000 },
        standard: { limit: 60, windowMs: 60_000 },
      },
    };
  },
});

export const setEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const settings = await ctx.db.query("settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, { rateLimitEnabled: args.enabled } as any);
    } else {
      await ctx.db.insert("settings", { vatRate: 7.5, rateLimitEnabled: args.enabled } as any);
    }
    const { audit } = await import("./lib/audit");
    await audit(ctx, args.enabled ? "settings.rateLimitEnabled" : "settings.rateLimitDisabled", "settings", settings?._id ?? "new" as any);
    return { enabled: args.enabled };
  },
});

export const logEvent = internalMutation({
  args: {
    key: v.string(),
    actionClass: v.string(),
    ts: v.number(),
    limit: v.number(),
    windowMs: v.number(),
    retryAfterMs: v.number(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("rateLimitEvents", {
      key: args.key,
      actionClass: args.actionClass,
      ts: args.ts,
      limit: args.limit,
      windowMs: args.windowMs,
      retryAfterMs: args.retryAfterMs,
      userId: args.userId,
    });
  },
});

export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoffEvents = now - 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffLimits = now - 24 * 60 * 60 * 1000; // 24h
    const oldEvents = await ctx.db.query("rateLimitEvents").withIndex("by_ts").order("asc").take(500);
    for (const e of oldEvents) {
      if (e.ts < cutoffEvents) await ctx.db.delete(e._id);
    }
    // rateLimits cleanup: scan for windows older than 24h
    const oldLimits = await ctx.db.query("rateLimits").take(500);
    for (const r of oldLimits) {
      if (r.windowStart < cutoffLimits) await ctx.db.delete(r._id);
    }
    return { prunedEvents: oldEvents.filter((e) => e.ts < cutoffEvents).length, prunedLimits: oldLimits.filter((r) => r.windowStart < cutoffLimits).length };
  },
});
