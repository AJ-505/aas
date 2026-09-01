import { z } from 'zod'

// Money in integer kobo.
export const moneyKobo = z.number().int().nonnegative()

// Convex document id (string). Used for fk references in forms.
export const id = z.string().min(1)

// Optional nullable string helper.
export const optionalString = z.string().trim().min(1).optional().or(z.literal(''))

export const vatRate = z.number().min(0).max(100)

// Phone: 7-15 digits, may include +, spaces, dashes, parentheses.
// Rejects letters. Valid: "0803 123 4567", "+2348012345678", "080-1234-5678"
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone is required')
  .regex(/^[\d\s+\-()]+$/, 'Phone must contain only numbers, spaces, +, -, ( )')
  .refine(
    (v) => {
      const digits = v.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    },
    { message: 'Phone must be 7-15 digits' },
  )

export const optionalPhoneSchema = phoneSchema.optional().or(z.literal(''))

// Pagination helper.
export const pagination = z.object({
  numItems: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
})
