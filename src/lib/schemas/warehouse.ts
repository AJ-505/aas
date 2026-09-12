import { z } from 'zod'

export const warehouseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  isHeadOffice: z.boolean().optional(),
})

export const warehouseTransferItemSchema = z.object({
  partId: z.string().min(1),
  qty: z.number().int().positive(),
  unit: z.string().trim().max(30).optional().or(z.literal('')),
  remarks: z.string().trim().max(200).optional().or(z.literal('')),
})

export const warehouseTransferSchema = z.object({
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  items: z.array(warehouseTransferItemSchema).min(1, 'Add at least one spare part.'),
})

export type WarehouseTransferInput = z.infer<typeof warehouseTransferSchema>
