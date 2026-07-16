import { z } from 'zod'
import { PARTS_REQUEST_STATUSES, STOCK_MOVEMENT_TYPES } from '../enums'
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

export const partsRequestStatusSchema = z.enum(PARTS_REQUEST_STATUSES)

export const createPartsRequestSchema = z.object({
  jobId: z.string().min(1),
  items: z
    .array(
      z.object({
        partId: z.string().min(1),
        qty: z.number().int().min(1),
      }),
    )
    .min(1, 'At least one part is required'),
})

export const reviewPartsRequestSchema = z.object({
  partsRequestId: z.string().min(1),
  status: z.enum(['approved', 'rejected']),
  note: z.string().trim().optional().or(z.literal('')),
})

export type CreatePartInput = z.infer<typeof createPartSchema>
export type CreatePartsRequestInput = z.infer<typeof createPartsRequestSchema>
