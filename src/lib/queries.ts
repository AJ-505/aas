import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

// ---- Phase 1 ----
export const customerQueries = {
  search: (q: string) => convexQuery(api.customers.search, { q }),
  detail: (customerId: string) => convexQuery(api.customers.getWithVehicles, { customerId: customerId as Id<'customers'> }),
}

export const vehicleQueries = {
  byCustomer: (customerId: string) => convexQuery(api.vehicles.byCustomer, { customerId: customerId as Id<'customers'> }),
  inventory: (status?: string) => convexQuery(api.vehicles.inventory, { status }),
}

export const userQueries = {
  list: () => convexQuery(api.users.list, {}),
  listTechnicians: () => convexQuery(api.users.listTechnicians, {}),
  adminExists: () => convexQuery(api.users.adminExists, {}),
}

// ---- Phase 2: Jobs ----
export const jobQueries = {
  all: (status?: string) => convexQuery(api.jobs.byStatus, { status }),
  myJobs: () => convexQuery(api.jobs.myJobs, {}),
  detail: (jobId: string) => convexQuery(api.jobs.getDetail, { jobId: jobId as Id<'jobs'> }),
  openCount: () => convexQuery(api.jobs.openCount, {}),
  dashboardSummary: () => convexQuery(api.jobs.dashboardSummary, {}),
  byCustomer: (customerId: string) => convexQuery(api.jobs.byCustomer, { customerId: customerId as Id<'customers'> }),
}

export const partQueries = {
  list: () => convexQuery(api.parts.list, {}),
  lowStock: () => convexQuery(api.parts.lowStock, {}),
  search: (q: string) => convexQuery(api.parts.search, { q }),
  movements: (partId: string) => convexQuery(api.parts.movements, { partId: partId as Id<'parts'> }),
}

export const labourTypeQueries = {
  list: () => convexQuery(api.labourTypes.list, {}),
}

export const partsRequestQueries = {
  pending: () => convexQuery(api.partsRequests.pending, {}),
  byJob: (jobId: string) => convexQuery(api.partsRequests.byJob, { jobId: jobId as Id<'jobs'> }),
}

export const settingsQueries = {
  get: () => convexQuery(api.settings.get, {}),
}

// ---- Mutations ----
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

// Job mutations
export function useCheckInMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.checkIn) })
}

export function useAssignMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.assign) })
}

export function useDiagnoseMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.diagnose) })
}

export function useStartWorkMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.startWork) })
}

export function useMarkReadyMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.markReady) })
}

export function useCompleteMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.complete) })
}

export function useMarkPaidMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.markPaid) })
}

export function useAddJobItemMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.addJobItem) })
}

export function useRemoveJobItemMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.jobs.removeJobItem) })
}

// Parts request mutations
export function useCreatePartsRequestMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.partsRequests.create) })
}

export function useReviewPartsRequestMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.partsRequests.review) })
}

export function useDispatchPartsRequestMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.partsRequests.dispatch) })
}

// Invoice mutations
export function useGenerateInvoiceMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.invoices.generate) })
}

export function useApproveInvoiceMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.invoices.approve) })
}

// Payment mutations
export function useRecordPaymentMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.payments.record) })
}

// Labour type mutations
export function useCreateLabourTypeMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.labourTypes.create) })
}

export function useUpdateLabourTypeMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.labourTypes.update) })
}

export function useRemoveLabourTypeMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.labourTypes.remove) })
}

// ---- Appointments ----
export const appointmentQueries = {
  list: (date?: number) => convexQuery(api.appointments.list, { date }),
  upcoming: () => convexQuery(api.appointments.upcoming, {}),
  get: (appointmentId: string) => convexQuery(api.appointments.get, { appointmentId: appointmentId as Id<'appointments'> }),
}

// ---- Sales module ----
export const leadQueries = {
  list: () => convexQuery(api.leads.list, {}),
  search: (q: string) => convexQuery(api.leads.search, { q }),
  get: (leadId: string) => convexQuery(api.leads.get, { leadId: leadId as Id<'leads'> }),
}

export const salesOrderQueries = {
  list: () => convexQuery(api.salesOrders.list, {}),
  get: (salesOrderId: string) => convexQuery(api.salesOrders.get, { salesOrderId: salesOrderId as Id<'salesOrders'> }),
  byVehicle: (vehicleId: string) => convexQuery(api.salesOrders.byVehicle, { vehicleId: vehicleId as Id<'vehicles'> }),
  byLead: (leadId: string) => convexQuery(api.salesOrders.byLead, { leadId: leadId as Id<'leads'> }),
}

export const deliveryQueries = {
  get: (deliveryId: string) => convexQuery(api.deliveries.get, { deliveryId: deliveryId as Id<'deliveries'> }),
  getBySalesOrder: (salesOrderId: string) => convexQuery(api.deliveries.getBySalesOrder, { salesOrderId: salesOrderId as Id<'salesOrders'> }),
}

// Appointment mutations
export function useCreateAppointmentMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.appointments.create) })
}

export function useMarkAppointmentCheckedInMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.appointments.markCheckedIn) })
}

export function useCancelAppointmentMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.appointments.cancel) })
}

// Sales mutations
export function useCreateLeadMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.leads.create) })
}

export function useUpdateLeadStageMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.leads.updateStage) })
}

export function useLogFollowUpMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.leads.logFollowUp) })
}

export function useCreateSalesOrderMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.salesOrders.create) })
}

export function useCompleteSalesOrderMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.salesOrders.complete) })
}

export function useCancelSalesOrderMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.salesOrders.cancel) })
}

export function useCompleteDeliveryMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.deliveries.complete) })
}

// Parts mutations
export function useCreatePartMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.parts.createPart) })
}

export function useUpdatePartMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.parts.updatePart) })
}

export function useAdjustStockMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.parts.adjustStock) })
}

export function useImportPartsMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.parts.importParts) })
}

// Settings mutations
export function useSetVatRateMutation() {
  return useMutation({ mutationFn: useConvexMutation(api.settings.setVatRate) })
}
