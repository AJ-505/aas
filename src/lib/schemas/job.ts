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



export const addJobItemSchema = z
  .object({
    jobId: z.string().min(1).max(64),
    type: jobItemTypeSchema,
    partId: z.string().min(1).max(64).optional(),
    labourTypeId: z.string().min(1).max(64).optional(),
    qty: z.number().int().min(1).max(999).default(1),
    unitPrice: z.number().int().min(0).max(10_000_000),
  })
  .superRefine((v, ctx) => {
    if (v.type === "part" && !v.partId) ctx.addIssue({ code: "custom", message: "partId required for part items", path: ["partId"] })
    if (v.type === "labour" && !v.labourTypeId) ctx.addIssue({ code: "custom", message: "labourTypeId required for labour items", path: ["labourTypeId"] })
    if (v.type === "part" && v.labourTypeId) ctx.addIssue({ code: "custom", message: "labourTypeId must not be set for part items", path: ["labourTypeId"] })
    if (v.type === "labour" && v.partId) ctx.addIssue({ code: "custom", message: "partId must not be set for labour items", path: ["partId"] })
  })

export const updateJobStatusSchema = z.object({
  jobId: z.string().min(1),
  status: jobStatusSchema,
})

export type CheckInJobInput = z.infer<typeof checkInJobSchema>
export type AddJobItemInput = z.infer<typeof addJobItemSchema>
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>
