import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { requireUser, requireRole } from './lib/auth'
import { audit } from './lib/audit'
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../src/lib/schemas'

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const q = args.q.trim()
    if (!q) {
      return await ctx.db.query('customers').order('desc').take(50)
    }
    const byName = await ctx.db
      .query('customers')
      .withSearchIndex('name', (s) => s.search('name', q))
      .take(20)
    const byPhone = await ctx.db
      .query('customers')
      .withSearchIndex('search_phone', (s) => s.search('phone', q))
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
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    return await ctx.db.get(args.customerId)
  },
})

export const getWithVehicles = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const customer = await ctx.db.get(args.customerId)
    if (!customer) throw new ConvexError('Customer not found.')
    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('owner', (q) => q.eq('ownerId', args.customerId))
      .collect()
    return { customer, vehicles }
  },
})

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i]![0] = i
  for (let j = 0; j <= n; j++) dp[0]![j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
    }
  }
  return dp[m]![n]!
}

function isVerySimilarName(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (na === nb) return true
  if (levenshtein(na, nb) <= 2) return true
  return false
}

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const parsed = createCustomerSchema.parse(args)
    const trimmedPhone = parsed.phone.trim()
    const trimmedName = parsed.name.trim()

    // Server-enforced duplicate guard: exact trimmed phone match OR same phone + very similar name
    const existingByPhone = await ctx.db
      .query('customers')
      .withIndex('by_phone', (q) => q.eq('phone', trimmedPhone))
      .first()

    if (existingByPhone) {
      // exact phone match is duplicate regardless of name, but we also check name similarity for richer error
      const similar = isVerySimilarName(existingByPhone.name, trimmedName)
      throw new ConvexError({
        message: similar
          ? `Duplicate customer: phone ${trimmedPhone} already exists (name very similar to ${existingByPhone.name}). Use existing customer.`
          : `Duplicate customer: phone ${trimmedPhone} already exists for ${existingByPhone.name}. Use existing customer.`,
        existingCustomerId: existingByPhone._id,
        existingName: existingByPhone.name,
        existingPhone: existingByPhone.phone,
      } as any)
    }

    // Also check for same phone with very similar name via full scan for near-duplicate phones that differ only by trim? Already exact, but per spec do second pass scanning same phone candidates (redundant safety)
    // For completeness, if phone matches trimmed and name similar, we already threw above.

    const id = await ctx.db.insert('customers', {
      name: trimmedName,
      phone: trimmedPhone,
      email: parsed.email && parsed.email.length > 0 ? parsed.email.trim() : undefined,
      address: parsed.address && parsed.address.length > 0 ? parsed.address.trim() : undefined,
    })
    await audit(ctx, 'customer.create', 'customers', id)
    return id
  },
})

export const update = mutation({
  args: {
    customerId: v.id('customers'),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['csr', 'salesRep', 'manager', 'admin'])
    const { customerId, ...patch } = args
    const parsed = updateCustomerSchema.parse(patch)
    // Duplicate guard on phone change: prevent update from creating a phone collision.
    if (parsed.phone !== undefined && parsed.phone.trim().length > 0) {
      const trimmedPhone = parsed.phone.trim()
      const collision = await ctx.db
        .query('customers')
        .withIndex('by_phone', (q) => q.eq('phone', trimmedPhone))
        .first()
      if (collision && collision._id !== customerId) {
        throw new ConvexError({
          message: `Duplicate customer: phone ${trimmedPhone} already exists for ${collision.name}. Use existing customer.`,
          existingCustomerId: collision._id,
          existingName: collision.name,
          existingPhone: collision.phone,
        } as any)
      }
      // Normalize to trimmed form before patch
      ;(parsed as any).phone = trimmedPhone
    }
    if (parsed.name !== undefined) (parsed as any).name = parsed.name.trim()
    if (parsed.email !== undefined) (parsed as any).email = parsed.email.trim() || undefined
    if (parsed.address !== undefined) (parsed as any).address = parsed.address.trim() || undefined
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== undefined) clean[k] = v === '' ? undefined : v
    }
    if (Object.keys(clean).length === 0) return null
    await ctx.db.patch(customerId, clean)
    await audit(ctx, 'customer.update', 'customers', customerId)
    return null
  },
})
