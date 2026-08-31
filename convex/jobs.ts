import { query, mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { v, ConvexError } from 'convex/values'
import { requireUser } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { canTransition, resolveJobStatusAfterInvoicePayment } from '../src/lib/job-utils'
import type { JobStatus } from '../src/lib/enums'
import { addJobItemSchema, checkInJobSchema } from '../src/lib/schemas'
import { computeInvoiceTotals, type InvoiceLineItem } from '../src/lib/schemas/invoice'
import { findApprovedFinalForJob } from './lib/invoiceHelpers'
import { enforce, enforceDedup } from "./lib/rateLimit";

export const getDetail = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')

    const vehicle = await ctx.db.get(job.vehicleId)
    const customer = await ctx.db.get(job.customerId)
    const csr = await ctx.db.get(job.csrId)
    const diagnosedBy = job.diagnosedById ? await ctx.db.get(job.diagnosedById) : null
    const jobItems = await ctx.db
      .query('jobItems')
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
      diagnosedBy: diagnosedBy
        ? { _id: diagnosedBy._id, name: diagnosedBy.name ?? null }
        : null,
      csr: csr ? { _id: csr._id, name: csr.name ?? null } : null,
      jobItems,
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
        }
      }),
    )
  },
})

export const openCount = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const jobs = await ctx.db.query('jobs').collect()
    let count = 0
    for (const job of jobs) {
      if (job.status !== 'completed' && job.status !== 'paid') count++
    }
    return count
  },
})

export const dashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    const jobs = await ctx.db.query('jobs').collect()
    const customers = await ctx.db.query('customers').collect()

    const now = Date.now()
    const dayMs = 86_400_000
    const weekAgo = now - 7 * dayMs
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    let open = 0
    let inProgress = 0
    let ready = 0
    let checkedInThisWeek = 0
    const checkinTrend = new Array<number>(7).fill(0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()

    for (const job of jobs) {
      if (job.status !== 'completed' && job.status !== 'paid') open++
      if (job.status === 'inProgress') inProgress++
      if (job.status === 'readyForPickup') ready++
      if (job.checkInTs >= weekAgo) checkedInThisWeek++

      const d = new Date(job.checkInTs)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((todayStart - d.getTime()) / dayMs)
      if (diff >= 0 && diff < 7) checkinTrend[6 - diff]!++
    }

    const customerTrend = new Array<number>(7).fill(0)
    let newThisMonth = 0
    for (const c of customers) {
      if (c._creationTime >= monthStart.getTime()) newThisMonth++
      const d = new Date(c._creationTime)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((todayStart - d.getTime()) / dayMs)
      if (diff >= 0 && diff < 7) customerTrend[6 - diff]!++
    }

    const recentJobs = [...jobs].sort((a, b) => b.checkInTs - a.checkInTs).slice(0, 8)
    const recent = await Promise.all(
      recentJobs.map(async (job) => {
        const vehicle = await ctx.db.get(job.vehicleId)
        const customer = await ctx.db.get(job.customerId)
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
              }
            : null,
          customer: customer
            ? { _id: customer._id, name: customer.name, phone: customer.phone }
            : null,
        }
      }),
    )

    return {
      open,
      inProgress,
      ready,
      checkedInThisWeek,
      checkinTrend,
      customersTotal: customers.length,
      newThisMonth,
      customerTrend,
      recent,
    }
  },
})

export const byCustomer = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const jobs = await ctx.db
      .query('jobs')
      .withIndex('customerId', (q) => q.eq('customerId', args.customerId))
      .order('desc')
      .collect()
    return await Promise.all(
      jobs.map(async (job) => {
        const vehicle = await ctx.db.get(job.vehicleId)
        return {
          _id: job._id,
          status: job.status,
          complaint: job.complaint,
          checkInTs: job.checkInTs,
          completedTs: job.completedTs,
          vehicle: vehicle
            ? {
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                plate: vehicle.plate ?? null,
              }
            : null,
        }
      }),
    )
  },
})



export const checkIn = mutation({
  args: {
    vehicleId: v.id('vehicles'),
    customerId: v.id('customers'),
    complaint: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['csr', 'manager', 'admin'])
    
    await enforce(ctx, "standard");const parsed = checkInJobSchema.parse({
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

export const diagnose = mutation({
  args: {
    jobId: v.id('jobs'),
    diagnosis: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['inventoryManager', 'manager', 'admin'])
    
    await enforce(ctx, "standard");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (!canTransition(job.status, 'diagnosed')) {
      throw new ConvexError(`Cannot diagnose a job that is "${job.status}".`)
    }

    await ctx.db.patch(args.jobId, {
      status: 'diagnosed',
      diagnosis: args.diagnosis,
      diagnosedTs: Date.now(),
      diagnosedById: user._id,
    })
    await audit(ctx, 'job.diagnose', 'jobs', args.jobId)
    return null
  },
})



export const markReady = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['inventoryManager', 'manager', 'admin'])
    
    await enforce(ctx, "standard");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
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
    await requireActiveSession(ctx, ['manager', 'admin'])
    
    await enforce(ctx, "standard");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (!canTransition(job.status, 'completed')) {
      throw new ConvexError(`Cannot complete a job that is "${job.status}".`)
    }

    const invoice = await ctx.db
      .query('invoices')
      .withIndex('jobId', (q: any) => q.eq('jobId', args.jobId))
      .first()

    const nextStatus = invoice && invoice.paid ? 'paid' : 'completed'
    await ctx.db.patch(args.jobId, {
      status: nextStatus,
      completedTs: Date.now(),
      paidTs: nextStatus === 'paid' ? Date.now() : undefined,
    })
    await audit(ctx, 'job.complete', 'jobs', args.jobId)
    return null
  },
})

export const markPaid = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['finance', 'manager', 'admin'])
    
    await enforce(ctx, "financial");const job = await ctx.db.get(args.jobId)
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

    const resolvedStatus = resolveJobStatusAfterInvoicePayment(job.status, true)
    await ctx.db.patch(args.jobId, {
      status: resolvedStatus,
      paidTs: Date.now(),
    })
    await ctx.db.patch(invoice._id, { paid: true })
    await audit(ctx, 'job.markPaid', 'jobs', args.jobId)
    return null
  },
})

export async function syncInvoiceForJob(ctx: any, jobId: Id<'jobs'>) {
  const existing = await ctx.db
    .query('invoices')
    .withIndex('jobId', (q: any) => q.eq('jobId', jobId))
    .first()
  if (!existing || existing.paid) return
  if ((existing as any).locked) return

  const jobItems = await ctx.db
    .query('jobItems')
    .withIndex('jobId', (q: any) => q.eq('jobId', jobId))
    .collect()

  const lineItems: InvoiceLineItem[] = jobItems.map((item: any) => ({
    type: item.type,
    description: '',
    qty: item.qty,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  }))

  for (const [i, item] of jobItems.entries()) {
    const li = lineItems[i]
    if (!li) continue
    if (item.type === 'part' && item.partId) {
      const part = await ctx.db.get(item.partId)
      if (part) li.description = `${part.code} - ${part.description}`
    } else if (item.type === 'labour' && item.labourTypeId) {
      const lt = await ctx.db.get(item.labourTypeId)
      if (lt) li.description = lt.name
    }
  }

  const settings = await ctx.db.query('settings').first()
  const vatRate = settings?.vatRate ?? 7.5
  const totals = computeInvoiceTotals(lineItems, vatRate)

  await ctx.db.patch(existing._id, {
    lineItems,
    partsTotal: totals.partsTotal,
    labourTotal: totals.labourTotal,
    subtotal: totals.subtotal,
    vat: totals.vat,
    grandTotal: totals.grandTotal,
    approved: false,
  })
}

export const reverseReady = mutation({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, ['manager', 'admin'])
    
    await enforce(ctx, "standard");const job = await ctx.db.get(args.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.status !== 'readyForPickup') {
      throw new ConvexError('Only jobs in readyForPickup can be reversed.')
    }
    const approvedFinal = await findApprovedFinalForJob(ctx, args.jobId)
    if (approvedFinal) {
      throw new ConvexError('Cannot reverse ready-for-pickup after final invoice is approved/locked.')
    }
    await ctx.db.patch(args.jobId, {
      status: 'inProgress',
      readyForPickupTs: undefined,
      reversedReadyTs: Date.now(),
    })
    await audit(ctx, 'job.reverseReady', 'jobs', args.jobId)
    return null
  },
})

export const addJobItem = mutation({
  args: {
    jobId: v.id('jobs'),
    type: v.union(v.literal("part"), v.literal("labour")),
    partId: v.optional(v.id('parts')),
    labourTypeId: v.optional(v.id('labourTypes')),
    qty: v.number(),
    unitPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const parsed = addJobItemSchema.parse({ jobId: args.jobId, type: args.type, partId: args.partId as any, labourTypeId: args.labourTypeId as any, qty: args.qty, unitPrice: args.unitPrice })
    const user = await requireActiveSession(ctx, ['inventoryManager', 'finance', 'csr', 'manager', 'admin'])

    await enforce(ctx, "standard");const job = await ctx.db.get(parsed.jobId as Id<'jobs'>)
    if (!job) throw new ConvexError('Job not found.')
    if (job.status === 'completed' || job.status === 'paid') {
      throw new ConvexError('Cannot add items to a job that is completed or paid.')
    }
    // Locked guard: no writes if approved final exists/locked
    {
      const approvedFinal = await findApprovedFinalForJob(ctx, args.jobId)
      if (approvedFinal) throw new ConvexError('Cannot add items: final invoice is locked.')
      const allInvoices = await ctx.db.query('invoices').withIndex('jobId', (q: any) => q.eq('jobId', args.jobId)).collect()
      if (allInvoices.some((i: any) => i.locked)) throw new ConvexError('Cannot add items: invoice is locked — unlock by Admin required.')
    }

    const type = parsed.type as 'part' | 'labour'
    let description = ''
    let itemId: Id<'jobItems'> | null = null

    if (type === 'part') {
      if (!parsed.partId) throw new ConvexError('Part items need a partId.')
      if (user.role !== 'inventoryManager' && user.role !== 'manager' && user.role !== 'admin') {
        throw new ConvexError('Only Inventory Manager, Manager, or Admin can add spare parts.')
      }
      if (!job.diagnosis || !job.diagnosis.trim()) {
        throw new ConvexError('Diagnosis is required before spare parts can be added to a job.')
      }

      const part = await ctx.db.get(parsed.partId as Id<'parts'>)
      if (!part) throw new ConvexError('Part not found.')
      if (part.stockQty < parsed.qty) {
        throw new ConvexError(`Insufficient stock for ${part.code}. Available: ${part.stockQty}, requested: ${parsed.qty}`)
      }
      description = `${part.code} - ${part.description}`

      const jobItems = await ctx.db.query('jobItems').withIndex('jobId', (q: any) => q.eq('jobId', parsed.jobId)).collect()
      const existing = jobItems.find((candidate: any) => candidate.type === 'part' && candidate.partId === parsed.partId)

      if (existing) {
        const nextQty = existing.qty + parsed.qty
        await ctx.db.patch(existing._id, {
          qty: nextQty,
          unitPrice: parsed.unitPrice,
          lineTotal: nextQty * parsed.unitPrice,
        })
        itemId = existing._id
      } else {
        itemId = await ctx.db.insert('jobItems', {
          jobId: parsed.jobId as Id<'jobs'>,
          type,
          partId: parsed.partId as Id<'parts'>,
          qty: parsed.qty,
          unitPrice: parsed.unitPrice,
          lineTotal: parsed.unitPrice * parsed.qty,
        })
      }

      await ctx.db.patch(parsed.partId as Id<'parts'>, { stockQty: part.stockQty - parsed.qty })
      await ctx.db.insert('stockMovements', {
        partId: parsed.partId as Id<'parts'>,
        qty: parsed.qty,
        type: 'out',
        jobId: parsed.jobId as Id<'jobs'>,
        ts: Date.now(),
        userId: user._id,
      })
    } else {
      if (!parsed.labourTypeId) throw new ConvexError('Labour items need a labourTypeId.')
      const lt = await ctx.db.get(parsed.labourTypeId as Id<'labourTypes'>)
      if (!lt) throw new ConvexError('Labour type not found.')
      description = lt.name
      itemId = await ctx.db.insert('jobItems', {
        jobId: parsed.jobId as Id<'jobs'>,
        type,
        labourTypeId: parsed.labourTypeId as Id<'labourTypes'>,
        qty: parsed.qty,
        unitPrice: parsed.unitPrice,
        lineTotal: parsed.unitPrice * parsed.qty,
      })
    }

    if (!itemId) {
      throw new ConvexError('Unable to create job item.')
    }
    await audit(ctx, 'job.addItem', 'jobItems', itemId)

    if (job.status === 'checkedIn' || job.status === 'diagnosed') {
      await ctx.db.patch(parsed.jobId as Id<'jobs'>, {
        status: 'inProgress',
        inProgressTs: job.inProgressTs ?? Date.now(),
      })
    }

    await syncInvoiceForJob(ctx, parsed.jobId as Id<'jobs'>)
    return itemId
  },
})

export const removeJobItem = mutation({
  args: { jobItemId: v.id('jobItems') },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['inventoryManager', 'finance', 'manager', 'admin'])

    await enforce(ctx, "standard");const item = await ctx.db.get(args.jobItemId)
    if (!item) throw new ConvexError('Job item not found.')
    const job = await ctx.db.get(item.jobId)
    if (!job) throw new ConvexError('Job not found.')
    if (job.status === 'completed' || job.status === 'paid') {
      throw new ConvexError('Cannot remove items from a job that is completed or paid.')
    }
    {
      const approvedFinal = await findApprovedFinalForJob(ctx, item.jobId)
      if (approvedFinal) throw new ConvexError('Cannot remove items: final invoice is locked.')
      const allInvoices = await ctx.db.query('invoices').withIndex('jobId', (q: any) => q.eq('jobId', item.jobId)).collect()
      if (allInvoices.some((i: any) => i.locked)) throw new ConvexError('Cannot remove items: invoice is locked — unlock by Admin required.')
    }

    if (item.type === 'part' && item.partId) {
      const part = await ctx.db.get(item.partId)
      if (part) {
        await ctx.db.patch(item.partId, { stockQty: part.stockQty + item.qty })
        await ctx.db.insert('stockMovements', {
          partId: item.partId,
          qty: item.qty,
          type: 'in',
          jobId: item.jobId,
          ts: Date.now(),
          userId: user._id,
        })
      }
    }

    await ctx.db.delete(args.jobItemId)
    await syncInvoiceForJob(ctx, item.jobId)
    return null
  },
})
