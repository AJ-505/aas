import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import {
  createLeadSchema,
  updateLeadStageSchema,
  logFollowUpSchema,
} from '../src/lib/schemas'

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db.query('leads').order('desc').take(100)
  },
})

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const q = args.q.trim()
    if (!q) {
      return await ctx.db.query('leads').order('desc').take(50)
    }
    const byName = await ctx.db
      .query('leads')
      .withSearchIndex('name', (s) => s.search('name', q))
      .take(20)
    const byPhone = await ctx.db
      .query('leads')
      .withSearchIndex('phone', (s) => s.search('phone', q))
      .take(20)
    const seen = new Set<string>()
    const merged = []
    for (const c of [...byName, ...byPhone]) {
      if (!seen.has(c._id)) {
        seen.add(c._id)
        merged.push(c)
      }
    }
    return merged
  },
})

export const get = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.leadId)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    interestedVehicleId: v.optional(v.id('vehicles')),
    nextFollowUpTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = createLeadSchema.parse(args)
    const id = await ctx.db.insert('leads', {
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email && parsed.email.length > 0 ? parsed.email : undefined,
      interestedVehicleId: args.interestedVehicleId,
      stage: 'new',
      notes: [],
      nextFollowUpTs: parsed.nextFollowUpTs,
    })
    await audit(ctx, 'lead.create', 'leads', id)
    return id
  },
})

export const updateStage = mutation({
  args: {
    leadId: v.id('leads'),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = updateLeadStageSchema.parse(args)
    await ctx.db.patch(args.leadId, { stage: parsed.stage })
    await audit(ctx, 'lead.updateStage', 'leads', args.leadId)
  },
})

export const logFollowUp = mutation({
  args: {
    leadId: v.id('leads'),
    note: v.string(),
    nextFollowUpTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = logFollowUpSchema.parse(args)
    const lead = await ctx.db.get(args.leadId)
    if (!lead) throw new ConvexError('Lead not found.')
    const notes = [...lead.notes, { text: parsed.note, ts: Date.now() }]
    const patch: Record<string, unknown> = { notes }
    if (parsed.nextFollowUpTs !== undefined) {
      patch.nextFollowUpTs = parsed.nextFollowUpTs
    }
    await ctx.db.patch(args.leadId, patch)
    await audit(ctx, 'lead.followUp', 'leads', args.leadId)
  },
})
