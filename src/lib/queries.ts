import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'

export const customerQueries = {
  search: (q: string) => convexQuery(api.customers.search, { q }),
  detail: (customerId: string) => convexQuery(api.customers.getWithVehicles, { customerId }),
}

export const vehicleQueries = {
  byCustomer: (customerId: string) => convexQuery(api.vehicles.byCustomer, { customerId }),
  inventory: (status?: string) => convexQuery(api.vehicles.inventory, { status }),
}

export const userQueries = {
  list: () => convexQuery(api.users.list, {}),
  adminExists: () => convexQuery(api.users.adminExists, {}),
}

export function useCreateCustomerMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.customers.create) })
}

export function useCreateVehicleMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.vehicles.create) })
}

export function useSetRoleMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.users.setRole) })
}

export function useSetActiveMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.users.setActive) })
}

export function useBootstrapFirstAdminMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.users.bootstrapFirstAdmin) })
}
