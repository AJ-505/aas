import { z } from 'zod'
import { VEHICLE_STATUSES } from '../enums'
import { moneyKobo } from './common'

export const vehicleStatusSchema = z.enum(VEHICLE_STATUSES)

export const PLATE_REGEX = /^[A-Z0-9][A-Z0-9 -]{2,}$/

function plateValidator() {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val.length === 0) return true
        const normalized = val.trim().toUpperCase()
        return PLATE_REGEX.test(normalized)
      },
      { message: 'Plate must be 3+ chars, uppercase alphanumerics, spaces or hyphens (e.g. LSD-123-HG)' },
    )
}

export const createVehicleSchema = z.object({
  ownerId: z.string().min(1).optional(),
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().trim().min(1, 'Colour is required'),
  vin: z.string().trim().optional().or(z.literal('')),
  plate: plateValidator(),
  // Sales-side fields (only relevant for inStock/reserved/sold vehicles).
  cost: moneyKobo.optional(),
  sellingPrice: moneyKobo.optional(),
  status: vehicleStatusSchema.default('customerOwned'),
  stockQty: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
})


export const updateVehicleSchema = createVehicleSchema.partial()

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
