import { z } from 'zod'
import { VEHICLE_STATUSES } from '../enums'
import { moneyKobo } from './common'

export const vehicleStatusSchema = z.enum(VEHICLE_STATUSES)

export const createVehicleSchema = z.object({
  ownerId: z.string().min(1).optional(),
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().trim().min(1, 'Colour is required'),
  vin: z.string().trim().optional().or(z.literal('')),
  plate: z.string().trim().optional().or(z.literal('')),
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
