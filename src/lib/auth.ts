import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Role } from './enums'

export interface CurrentUser {
  _id: string
  name: string | null
  email: string | null
  phone: string | null
  role: Role | null
  active: boolean
}

export function useCurrentUser() {
  return useQuery(convexQuery(api.users.me, {}))
}
