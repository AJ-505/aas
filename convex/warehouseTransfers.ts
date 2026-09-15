import { query, mutation } from './_generated/server'
import { v, ConvexError } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { requireUser } from './lib/auth'
import { requireActiveSession } from './lib/session'
import { audit } from './lib/audit'
import { warehouseTransferSchema } from '../src/lib/schemas'
import { nextDocumentNumber } from './lib/documentNumbers'
import { enforce } from './lib/rateLimit'

const TRANSFER_ROLES = ['csr', 'inventoryManager', 'admin'] as const

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.db
      .query('warehouseTransfers')
      .withIndex('by_ts')
      .order('desc')
      .take(200)
  },
})

export const get = query({
  args: { transferId: v.id('warehouseTransfers') },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const transfer = await ctx.db.get(args.transferId)
    if (!transfer) throw new ConvexError('Transfer not found.')
    const createdBy = await ctx.db.get(transfer.createdById)
    const receivedBy = transfer.receivedById
      ? await ctx.db.get(transfer.receivedById)
      : null
    // Backfill location addresses for waybills created before the
    // fromAddress/toAddress snapshot fields existed.
    const fromWarehouse = await ctx.db.get(transfer.fromWarehouseId)
    const toWarehouse = await ctx.db.get(transfer.toWarehouseId)
    const enriched = {
      ...transfer,
      fromAddress:
        (transfer as any).fromAddress ?? (fromWarehouse as any)?.address ?? undefined,
      toAddress: (transfer as any).toAddress ?? (toWarehouse as any)?.address ?? undefined,
    }
    return {
      transfer: enriched,
      createdBy: createdBy
        ? { _id: createdBy._id, name: createdBy.name ?? null, email: createdBy.email ?? null }
        : null,
      receivedBy: receivedBy
        ? { _id: receivedBy._id, name: receivedBy.name ?? null, email: receivedBy.email ?? null }
        : null,
    }
  },
})

export const create = mutation({
  args: {
    fromWarehouseId: v.id('warehouses'),
    toWarehouseId: v.id('warehouses'),
    items: v.array(
      v.object({
        partId: v.id('parts'),
        qty: v.number(),
        unit: v.optional(v.string()),
        remarks: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, [...TRANSFER_ROLES])
    await enforce(ctx, 'standard')

    const parsed = warehouseTransferSchema.parse(args)
    if (parsed.fromWarehouseId === parsed.toWarehouseId) {
      throw new ConvexError('Source and destination warehouses must be different.')
    }

    const from = await ctx.db.get(parsed.fromWarehouseId as Id<'warehouses'>)
    const to = await ctx.db.get(parsed.toWarehouseId as Id<'warehouses'>)
    if (!from) throw new ConvexError('Source warehouse not found.')
    if (!to) throw new ConvexError('Destination warehouse not found.')

    const storedItems: Array<{
      partId: Id<'parts'>
      code: string
      description: string
      qty: number
      unit?: string
      remarks?: string
    }> = []
    for (const item of parsed.items) {
      const part = await ctx.db.get(item.partId as Id<'parts'>)
      if (!part) throw new ConvexError('Part not found.')
      if (part.stockQty < item.qty) {
        throw new ConvexError(
          `Insufficient stock for ${part.code}. Available: ${part.stockQty}, requested: ${item.qty}.`,
        )
      }
      storedItems.push({
        partId: part._id,
        code: part.code,
        description: part.description,
        qty: item.qty,
        unit: item.unit || undefined,
        remarks: item.remarks || undefined,
      })
    }

    for (const item of parsed.items) {
      const part = await ctx.db.get(item.partId as Id<'parts'>)
      if (!part) continue
      await ctx.db.patch(part._id, { stockQty: part.stockQty - item.qty })
      await ctx.db.insert('stockMovements', {
        partId: part._id,
        qty: item.qty,
        type: 'out',
        ts: Date.now(),
        userId: user._id,
      })
    }

    const waybillNumber = await nextDocumentNumber(ctx, 'waybill')
    const id = await ctx.db.insert('warehouseTransfers', {
      waybillNumber,
      fromWarehouseId: from._id,
      toWarehouseId: to._id,
      fromLabel: from.name,
      toLabel: to.name,
      fromAddress: (from as any).address || undefined,
      toAddress: (to as any).address || undefined,
      lineItems: storedItems,
      status: 'dispatched',
      createdById: user._id,
      ts: Date.now(),
    })
    await audit(ctx, 'warehouseTransfer.create', 'warehouseTransfers', id)
    return id
  },
})

export const markReceived = mutation({
  args: { transferId: v.id('warehouseTransfers') },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, [...TRANSFER_ROLES])
    await enforce(ctx, 'standard')
    const transfer = await ctx.db.get(args.transferId)
    if (!transfer) throw new ConvexError('Transfer not found.')
    if (transfer.status !== 'dispatched') {
      throw new ConvexError('Only dispatched transfers can be marked received.')
    }
    await ctx.db.patch(args.transferId, {
      status: 'received',
      receivedById: user._id,
      receivedTs: Date.now(),
    })
    await audit(ctx, 'warehouseTransfer.received', 'warehouseTransfers', args.transferId)
    return null
  },
})

export const cancel = mutation({
  args: { transferId: v.id('warehouseTransfers'), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await requireActiveSession(ctx, ['admin'])
    await enforce(ctx, 'admin')
    const reason = args.reason.trim()
    if (reason.length < 10) {
      throw new ConvexError('Cancellation reason must be at least 10 characters.')
    }
    if (reason.length > 300) throw new ConvexError('Reason too long.')
    const transfer = await ctx.db.get(args.transferId)
    if (!transfer) throw new ConvexError('Transfer not found.')
    if (transfer.status !== 'dispatched') {
      throw new ConvexError('Only dispatched transfers can be cancelled.')
    }
    for (const item of transfer.lineItems) {
      const part = await ctx.db.get(item.partId)
      if (!part) continue
      await ctx.db.patch(part._id, { stockQty: part.stockQty + item.qty })
      await ctx.db.insert('stockMovements', {
        partId: part._id,
        qty: item.qty,
        type: 'in',
        ts: Date.now(),
        userId: user._id,
      })
    }
    await ctx.db.patch(args.transferId, { status: 'cancelled' })
    await audit(
      ctx,
      `warehouseTransfer.cancel:${reason.slice(0, 80)}`,
      'warehouseTransfers',
      args.transferId,
    )
    return null
  },
})
