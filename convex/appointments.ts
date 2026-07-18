import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'

export const list = query({
  args: { date: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const startOfDay = args.date ?? Date.now()
    const endOfDay = startOfDay + 86_400_000
    const appointments = await ctx.db
      .query('appointments')
      .withIndex('appointmentTs', (q) =>
        q.gte('appointmentTs', startOfDay).lte('appointmentTs', endOfDay),
      )
      .order('asc')
      .collect()
    return appointments
  },
})

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db
      .query('appointments')
      .withIndex('status', (q) => q.eq('status', 'scheduled'))
      .filter((q) => q.gte(q.field('appointmentTs'), Date.now()))
      .order('asc')
      .take(20)
  },
})

export const get = query({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.appointmentId)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehiclePlate: v.optional(v.string()),
    complaint: v.optional(v.string()),
    appointmentTs: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['csr', 'manager', 'admin'])
    const id = await ctx.db.insert('appointments', {
      name: args.name,
      phone: args.phone,
      email: args.email,
      vehicleMake: args.vehicleMake,
      vehicleModel: args.vehicleModel,
      vehiclePlate: args.vehiclePlate,
      complaint: args.complaint,
      appointmentTs: args.appointmentTs,
      status: 'scheduled',
      createdById: user._id,
    })
    await audit(ctx, 'appointment.create', 'appointments', id)
    return id
  },
})

export const markCheckedIn = mutation({
  args: {
    appointmentId: v.id('appointments'),
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'manager', 'admin'])
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) throw new ConvexError('Appointment not found.')
    if (appointment.status !== 'scheduled') {
      throw new ConvexError('Appointment is not in scheduled status.')
    }
    await ctx.db.patch(args.appointmentId, {
      status: 'checkedIn',
      checkInJobId: args.jobId,
    })
    await audit(ctx, 'appointment.checkedIn', 'appointments', args.appointmentId)
  },
})

export const cancel = mutation({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'manager', 'admin'])
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) throw new ConvexError('Appointment not found.')
    await ctx.db.patch(args.appointmentId, { status: 'cancelled' })
    await audit(ctx, 'appointment.cancel', 'appointments', args.appointmentId)
  },
})
