import { z } from 'zod'
import { STOCK_MOVEMENT_TYPES } from '../enums'
import { moneyKobo } from './common'

export const createPartSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  description: z.string().trim().min(1, 'Description is required'),
  costPrice: moneyKobo,
  sellingPrice: moneyKobo,
  stockQty: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(0),
})

export const updatePartSchema = createPartSchema.partial()

export const stockMovementTypeSchema = z.enum(STOCK_MOVEMENT_TYPES)

export const stockMovementSchema = z.object({
  partId: z.string().min(1),
  qty: z.number().int(),
  type: stockMovementTypeSchema,
  jobId: z.string().min(1).optional(),
})

export type CreatePartInput = z.infer<typeof createPartSchema>

