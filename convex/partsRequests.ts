import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { canTransition } from '../src/lib/job-utils'
import { createPartsRequestSchema, reviewPartsRequestSchema } from '../src/lib/schemas'

export const byJob = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db
      .query('partsRequests')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
  },
})

export const pending = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db
      .query('partsRequests')
      .withIndex('status', (q) => q.eq('status', 'pending'))
      .collect()
  },
})

export const create = mutation({
  args: {
    jobId: v.id('jobs'),
    items: v.array(
      v.object({
        partId: v.id('parts'),
        qty: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const parsed = createPartsRequestSchema.parse(args)
    const job = await ctx.db.get(parsed.jobId as Id<'jobs'>)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    if (!canTransition(job.status, 'waitingRelease')) {
      throw new ConvexError(`Cannot request parts for a job that is "${job.status}".`)
    }

    // Validate all parts exist and have enough stock
    for (const item of parsed.items) {
      const part = await ctx.db.get(item.partId as Id<'parts'>)
      if (!part) throw new ConvexError('Part not found.')
      if (part.stockQty < item.qty) {
        throw new ConvexError(`Insufficient stock for ${part.code}. Available: ${part.stockQty}, requested: ${item.qty}`)
      }
    }

    const requestId = await ctx.db.insert('partsRequests', {
      jobId: parsed.jobId as Id<'jobs'>,
      technicianId: user._id,
      items: parsed.items.map((item) => ({
        partId: item.partId as Id<'parts'>,
        qty: item.qty,
      })),
      status: 'pending',
    })

    // Move job to waitingRelease
    await ctx.db.patch(parsed.jobId as Id<'jobs'>, {
      status: 'waitingRelease',
      waitingReleaseTs: Date.now(),
    })

    await audit(ctx, 'partsRequest.create', 'partsRequests', requestId)
    return requestId
  },
})

export const review = mutation({
  args: {
    partsRequestId: v.id('partsRequests'),
    status: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['inventoryManager', 'manager', 'admin'])
    const parsed = reviewPartsRequestSchema.parse({
      partsRequestId: args.partsRequestId,
      status: args.status as 'approved' | 'rejected',
      note: args.note,
    })
    const request = await ctx.db.get(parsed.partsRequestId as Id<'partsRequests'>)
    if (!request) throw new ConvexError('Parts request not found.')
    if (request.status !== 'pending') {
      throw new ConvexError(`Parts request is already "${request.status}".`)
    }

    await ctx.db.patch(parsed.partsRequestId as Id<'partsRequests'>, {
      status: parsed.status,
      reviewedByInventoryManagerId: user._id as Id<'users'>,
      reviewedTs: Date.now(),
      note: parsed.note,
    })

    // If rejected, move job back to diagnosed
    if (parsed.status === 'rejected') {
      const job = await ctx.db.get(request.jobId)
      if (job && job.status === 'waitingRelease') {
        await ctx.db.patch(request.jobId, { status: 'diagnosed' })
      }
    }

    await audit(ctx, `partsRequest.${parsed.status}`, 'partsRequests', parsed.partsRequestId)
    return null
  },
})

export const dispatch = mutation({
  args: { partsRequestId: v.id('partsRequests') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['inventoryManager', 'manager', 'admin'])
    const request = await ctx.db.get(args.partsRequestId)
    if (!request) throw new ConvexError('Parts request not found.')
    if (request.status !== 'approved') {
      throw new ConvexError(`Can only dispatch approved requests. Current status: "${request.status}".`)
    }

    // Decrement stock and create stock movements
    for (const item of request.items) {
      const part = await ctx.db.get(item.partId)
      if (!part) throw new ConvexError('Part not found during dispatch.')
      if (part.stockQty < item.qty) {
        throw new ConvexError(`Insufficient stock for ${part.code}. Available: ${part.stockQty}, needed: ${item.qty}`)
      }
      await ctx.db.patch(item.partId, { stockQty: part.stockQty - item.qty })
      await ctx.db.insert('stockMovements', {
        partId: item.partId,
        qty: item.qty,
        type: 'out',
        jobId: request.jobId,
        ts: Date.now(),
        userId: user._id,
      })
    }

    await ctx.db.patch(args.partsRequestId, { status: 'dispatched' })
    await audit(ctx, 'partsRequest.dispatch', 'partsRequests', args.partsRequestId)
    return null
  },
})
