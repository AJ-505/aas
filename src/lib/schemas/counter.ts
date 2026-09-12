import { z } from 'zod'

export const PAYMENT_METHODS_COUNTER = ['cash', 'transfer', 'card', 'pos'] as const

export const counterSaleItemSchema = z.object({
  partId: z.string().min(1),
  qty: z.number().int().positive(),
})

export const counterSaleSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS_COUNTER).optional(),
  items: z.array(counterSaleItemSchema).min(1, 'Add at least one spare part.'),
})

export type CounterSaleInput = z.infer<typeof counterSaleSchema>
