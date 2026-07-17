import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import { canTransition } from '../src/lib/job-utils'
import type { JobStatus } from '../src/lib/enums'
import { checkInJobSchema, assignTechnicianSchema } from '../src/lib/schemas'

export const getDetail = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    const vehicle = await ctx.db.get(job.vehicleId)
    const customer = await ctx.db.get(job.customerId)
    const technician = job.technicianId ? await ctx.db.get(job.technicianId) : null
    const csr = await ctx.db.get(job.csrId)
    const jobItems = await ctx.db
      .query('jobItems')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    const partsRequests = await ctx.db
      .query('partsRequests')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .collect()
    const invoice = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .first()
    const payments = invoice
      ? await ctx.db
          .query('payments')
          .withIndex('invoiceId', (q) => q.eq('invoiceId', invoice._id))
          .collect()
      : []

    return {
      job,
      vehicle,
      customer,
      technician: technician
        ? { _id: technician._id, name: technician.name ?? null }
        : null,
      csr: csr ? { _id: csr._id, name: csr.name ?? null } : null,
      jobItems,
      partsRequests,
      invoice: invoice ?? null,
      payments,
    }
  },
})

export const byStatus = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const jobs =
      args.status
        ? await ctx.db
            .query('jobs')
            .withIndex('status', (q) => q.eq('status', args.status as JobStatus))
            .order('desc')
            .collect()
        : await ctx.db.query('jobs').order('desc').collect()

    return await Promise.all(
      jobs.map(async (job) => {
        const vehicle = await ctx.db.get(job.vehicleId)
        const customer = await ctx.db.get(job.customerId)
        const technician = job.technicianId ? await ctx.db.get(job.technicianId) : null
        return {
          _id: job._id,
          status: job.status,
          complaint: job.complaint,
          checkInTs: job.checkInTs,
          vehicle: vehicle
            ? {
                _id: vehicle._id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                plate: vehicle.plate ?? null,
                color: vehicle.color,
              }
            : null,
          customer: customer
            ? { _id: customer._id, name: customer.name, phone: customer.phone }
            : null,
          technician: technician
            ? { _id: technician._id, name: technician.name ?? null }
            : null,
        }
      }),
    )
  },
})

export const myJobs = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx)
    return await ctx.db
      .query('jobs')
      .withIndex('technicianId', (q) => q.eq('technicianId', user._id))
      .order('desc')
      .collect()
  },
})

export const checkIn = mutation({
  args: {
    vehicleId: v.id('vehicles'),
    customerId: v.id('customers'),
    complaint: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['csr', 'manager', 'admin'])
    const parsed = checkInJobSchema.parse({
      ...args,
      csrId: user._id,
    })
    const vehicle = await ctx.db.get(parsed.vehicleId as Id<'vehicles'>)
    if (!vehicle) throw new ConvexError('Vehicle not found.')
    const customer = await ctx.db.get(parsed.customerId as Id<'customers'>)
    if (!customer) throw new ConvexError('Customer not found.')

    const jobId = await ctx.db.insert('jobs', {
      vehicleId: parsed.vehicleId as Id<'vehicles'>,
      customerId: parsed.customerId as Id<'customers'>,
      csrId: user._id,
      status: 'checkedIn',
      complaint: parsed.complaint,
      checkInTs: Date.now(),
    })
    await audit(ctx, 'job.checkIn', 'jobs', jobId)
    return jobId
  },
})

export const assign = mutation({
  args: {
    jobId: v.id('jobs'),
    technicianId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'manager', 'admin'])
    const parsed = assignTechnicianSchema.parse(args)
    const job = await ctx.db.get(parsed.jobId as Id<'jobs'>)
    if (!job) throw new ConvexError('Job not found.')
    if (!canTransition(job.status, 'assigned')) {
      throw new ConvexError(`Cannot assign a job that is "${job.status}".`)
    }
    const tech = await ctx.db.get(parsed.technicianId as Id<'users'>)
    if (!tech) throw new ConvexError('Technician not found.')
    if (tech.role !== 'technician' && tech.role !== 'admin' && tech.role !== 'manager') {
      throw new ConvexError('Assigned user must be a technician.')
    }

    await ctx.db.patch(parsed.jobId as Id<'jobs'>, {
      technicianId: parsed.technicianId as Id<'users'>,
      status: 'assigned',
      assignedTs: Date.now(),
    })
    await audit(ctx, 'job.assign', 'jobs', parsed.jobId)
    return null
  },
})

export const diagnose = mutation({
  args: {
    jobId: v.id('jobs'),
    diagnosis: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    if (!canTransition(job.status, 'diagnosed')) {
      throw new ConvexError(`Cannot diagnose a job that is "${job.status}".`)
    }

    await ctx.db.patch(args.jobId, {
      status: 'diagnosed',
      diagnosis: args.diagnosis,
      diagnosedTs: Date.now(),
    })
    await audit(ctx, 'job.diagnose', 'jobs', args.jobId)
    return null
  },
})

export const startWork = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    if (!canTransition(job.status, 'inProgress')) {
      throw new ConvexError(`Cannot start work on a job that is "${job.status}".`)
    }
    // If coming from waitingRelease, verify all parts requests are dispatched
    if (job.status === 'waitingRelease') {
      const requests = await ctx.db
        .query('partsRequests')
        .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
        .collect()
      const undispatched = requests.filter((r) => r.status !== 'dispatched' && r.status !== 'rejected')
      if (undispatched.length > 0) {
        throw new ConvexError('All parts requests must be dispatched or rejected before starting work.')
      }
    }

    await ctx.db.patch(args.jobId, {
      status: 'inProgress',
      inProgressTs: Date.now(),
    })
    await audit(ctx, 'job.startWork', 'jobs', args.jobId)
    return null
  },
})

export const markReady = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    if (!canTransition(job.status, 'readyForPickup')) {
      throw new ConvexError(`Cannot mark ready a job that is "${job.status}".`)
    }

    await ctx.db.patch(args.jobId, {
      status: 'readyForPickup',
      readyForPickupTs: Date.now(),
    })
    await audit(ctx, 'job.markReady', 'jobs', args.jobId)
    return null
  },
})

export const complete = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (!canTransition(job.status, 'completed')) {
      throw new ConvexError(`Cannot complete a job that is "${job.status}".`)
    }

    await ctx.db.patch(args.jobId, {
      status: 'completed',
      completedTs: Date.now(),
    })
    await audit(ctx, 'job.complete', 'jobs', args.jobId)
    return null
  },
})

export const markPaid = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['finance', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (!canTransition(job.status, 'paid')) {
      throw new ConvexError(`Cannot mark paid a job that is "${job.status}".`)
    }
    const invoice = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q) => q.eq('jobId', args.jobId))
      .first()
    if (!invoice) throw new ConvexError('No invoice found for this job.')
    if (!invoice.approved) throw new ConvexError('Invoice must be approved first.')
    if (invoice.amountPaid < invoice.grandTotal) {
      throw new ConvexError('Invoice is not fully paid.')
    }

    await ctx.db.patch(args.jobId, {
      status: 'paid',
      paidTs: Date.now(),
    })
    await ctx.db.patch(invoice._id, { paid: true })
    await audit(ctx, 'job.markPaid', 'jobs', args.jobId)
    return null
  },
})

export const addJobItem = mutation({
  args: {
    jobId: v.id('jobs'),
    type: v.string(),
    partId: v.optional(v.id('parts')),
    labourTypeId: v.optional(v.id('labourTypes')),
    qty: v.number(),
    unitPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    // Items can only be added before the invoice is generated
    if (job.status === 'readyForPickup' || job.status === 'completed' || job.status === 'paid') {
      throw new ConvexError('Cannot add items to a job that is past the work stage.')
    }

    const type = args.type as 'part' | 'labour'
    if (type !== 'part' && type !== 'labour') {
      throw new ConvexError('Item type must be "part" or "labour".')
    }

    let description = ''
    if (type === 'part' && args.partId) {
      const part = await ctx.db.get(args.partId)
      if (!part) throw new ConvexError('Part not found.')
      description = `${part.code} - ${part.description}`
    } else if (type === 'labour' && args.labourTypeId) {
      const lt = await ctx.db.get(args.labourTypeId)
      if (!lt) throw new ConvexError('Labour type not found.')
      description = lt.name
    } else {
      throw new ConvexError('Part items need a partId, labour items need a labourTypeId.')
    }

    const lineTotal = args.unitPrice * args.qty
    const itemId = await ctx.db.insert('jobItems', {
      jobId: args.jobId,
      type,
      partId: args.partId,
      labourTypeId: args.labourTypeId,
      qty: args.qty,
      unitPrice: args.unitPrice,
      lineTotal,
    })
    await audit(ctx, 'job.addItem', 'jobItems', itemId)
    return itemId
  },
})

export const removeJobItem = mutation({
  args: { jobItemId: v.id('jobItems') },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['technician', 'manager', 'admin'])
    const item = await ctx.db.get(args.jobItemId)
    if (!item) throw new ConvexError('Job item not found.')
    const job = await ctx.db.get(item.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.technicianId && job.technicianId !== user._id && user.role !== 'admin' && user.role !== 'manager') {
      throw new ConvexError('You are not the assigned technician for this job.')
    }
    if (job.status === 'readyForPickup' || job.status === 'completed' || job.status === 'paid') {
      throw new ConvexError('Cannot remove items from a job that is past the work stage.')
    }
    await ctx.db.delete(args.jobItemId)
    return null
  },
})
