import { z } from 'zod'
import { ROLES } from '../enums'

export const roleSchema = z.enum(ROLES)

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  role: roleSchema,
})

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
})

export const setUserActiveSchema = z.object({
  userId: z.string().min(1),
  active: z.boolean(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
