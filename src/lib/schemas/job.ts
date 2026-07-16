import { z } from 'zod'
import { JOB_ITEM_TYPES, JOB_STATUSES } from '../enums'

export const jobStatusSchema = z.enum(JOB_STATUSES)
export const jobItemTypeSchema = z.enum(JOB_ITEM_TYPES)

export const checkInJobSchema = z.object({
  vehicleId: z.string().min(1),
  customerId: z.string().min(1),
  csrId: z.string().min(1),
  complaint: z.string().trim().min(1, 'Complaint is required'),
})

export const assignTechnicianSchema = z.object({
  jobId: z.string().min(1),
  technicianId: z.string().min(1),
})

export const addJobItemSchema = z.object({
  jobId: z.string().min(1),
  type: jobItemTypeSchema,
  partId: z.string().min(1).optional(),
  labourTypeId: z.string().min(1).optional(),
  qty: z.number().int().min(1).default(1),
  unitPrice: z.number().int().nonnegative(),
})

export const updateJobStatusSchema = z.object({
  jobId: z.string().min(1),
  status: jobStatusSchema,
})

export type CheckInJobInput = z.infer<typeof checkInJobSchema>
export type AddJobItemInput = z.infer<typeof addJobItemSchema>
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>
