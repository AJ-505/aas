import { z } from 'zod'
import { LEAD_STAGES, SALES_ORDER_STATUSES } from '../enums'
import { moneyKobo } from './common'

export const leadStageSchema = z.enum(LEAD_STAGES)
export const salesOrderStatusSchema = z.enum(SALES_ORDER_STATUSES)

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  email: z.string().trim().email().optional().or(z.literal('')),
  interestedVehicleId: z.string().min(1).optional(),
  nextFollowUpTs: z.number().int().optional(),
})

export const updateLeadStageSchema = z.object({
  leadId: z.string().min(1),
  stage: leadStageSchema,
})

export const logFollowUpSchema = z.object({
  leadId: z.string().min(1),
  note: z.string().trim().min(1, 'Note is required'),
  nextFollowUpTs: z.number().int().optional(),
})

export const createSalesOrderSchema = z.object({
  vehicleId: z.string().min(1),
  leadId: z.string().min(1),
  agreedPrice: moneyKobo,
  deposit: moneyKobo.default(0),
})

export const deliveryChecklistSchema = z.object({
  keys: z.boolean().default(false),
  manual: z.boolean().default(false),
  toolkit: z.boolean().default(false),
  inspection: z.boolean().default(false),
})

export const completeDeliverySchema = z.object({
  salesOrderId: z.string().min(1),
  checklist: deliveryChecklistSchema,
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>
