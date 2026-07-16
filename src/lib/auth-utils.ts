import { ROLES, type Role } from './enums'

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

// Admin bypasses every role check. A null/undefined role is never authorized.
export function isAuthorized(
  role: Role | null | undefined,
  allowed: readonly Role[],
): boolean {
  if (!role) return false
  if (role === 'admin') return true
  return allowed.includes(role)
}
