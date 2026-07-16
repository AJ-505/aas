import { z } from 'zod'

// Money in integer kobo.
export const moneyKobo = z.number().int().nonnegative()

// Convex document id (string). Used for fk references in forms.
export const id = z.string().min(1)

// Optional nullable string helper.
export const optionalString = z.string().trim().min(1).optional().or(z.literal(''))

export const vatRate = z.number().min(0).max(100)

// Pagination helper.
export const pagination = z.object({
  numItems: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
})
