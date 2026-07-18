import { anyApi, useMutation } from "../_libs/@convex-dev/auth+[...].mjs";
import { convexQuery } from "../_libs/@convex-dev/react-query+[...].mjs";
import { useMutation as useMutation$1 } from "../_libs/tanstack__react-query.mjs";
import { componentsGeneric } from "../_libs/convex.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-DshR6pBd.js
/**
* Generated `api` utility.
*
* THIS CODE IS AUTOMATICALLY GENERATED.
*
* To regenerate, run `npx convex dev`.
* @module
*/
/**
* A utility for referencing Convex functions in your app's API.
*
* Usage:
* ```js
* const myFunctionReference = api.myModule.myFunction;
* ```
*/
var api = anyApi;
componentsGeneric();
var customerQueries = {
	search: (q) => convexQuery(api.customers.search, { q }),
	detail: (customerId) => convexQuery(api.customers.getWithVehicles, { customerId })
};
var vehicleQueries = {
	byCustomer: (customerId) => convexQuery(api.vehicles.byCustomer, { customerId }),
	inventory: (status) => convexQuery(api.vehicles.inventory, { status })
};
var userQueries = {
	list: () => convexQuery(api.users.list, {}),
	listTechnicians: () => convexQuery(api.users.listTechnicians, {}),
	adminExists: () => convexQuery(api.users.adminExists, {})
};
var jobQueries = {
	all: (status) => convexQuery(api.jobs.byStatus, { status }),
	myJobs: () => convexQuery(api.jobs.myJobs, {}),
	detail: (jobId) => convexQuery(api.jobs.getDetail, { jobId }),
	openCount: () => convexQuery(api.jobs.openCount, {}),
	dashboardSummary: () => convexQuery(api.jobs.dashboardSummary, {}),
	byCustomer: (customerId) => convexQuery(api.jobs.byCustomer, { customerId })
};
var partQueries = {
	list: () => convexQuery(api.parts.list, {}),
	lowStock: () => convexQuery(api.parts.lowStock, {}),
	search: (q) => convexQuery(api.parts.search, { q }),
	movements: (partId) => convexQuery(api.parts.movements, { partId })
};
var labourTypeQueries = { list: () => convexQuery(api.labourTypes.list, {}) };
var settingsQueries = { get: () => convexQuery(api.settings.get, {}) };
function useCreateCustomerMutation() {
	return useMutation$1({ mutationFn: useMutation(api.customers.create) });
}
function useCreateVehicleMutation() {
	return useMutation$1({ mutationFn: useMutation(api.vehicles.create) });
}
function useSetRoleMutation() {
	return useMutation$1({ mutationFn: useMutation(api.users.setRole) });
}
function useSetActiveMutation() {
	return useMutation$1({ mutationFn: useMutation(api.users.setActive) });
}
function useBootstrapFirstAdminMutation() {
	return useMutation$1({ mutationFn: useMutation(api.users.bootstrapFirstAdmin) });
}
function useCheckInMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.checkIn) });
}
function useAssignMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.assign) });
}
function useDiagnoseMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.diagnose) });
}
function useStartWorkMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.startWork) });
}
function useMarkReadyMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.markReady) });
}
function useCompleteMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.complete) });
}
function useMarkPaidMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.markPaid) });
}
function useAddJobItemMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.addJobItem) });
}
function useRemoveJobItemMutation() {
	return useMutation$1({ mutationFn: useMutation(api.jobs.removeJobItem) });
}
function useCreatePartsRequestMutation() {
	return useMutation$1({ mutationFn: useMutation(api.partsRequests.create) });
}
function useReviewPartsRequestMutation() {
	return useMutation$1({ mutationFn: useMutation(api.partsRequests.review) });
}
function useDispatchPartsRequestMutation() {
	return useMutation$1({ mutationFn: useMutation(api.partsRequests.dispatch) });
}
function useGenerateInvoiceMutation() {
	return useMutation$1({ mutationFn: useMutation(api.invoices.generate) });
}
function useApproveInvoiceMutation() {
	return useMutation$1({ mutationFn: useMutation(api.invoices.approve) });
}
function useRecordPaymentMutation() {
	return useMutation$1({ mutationFn: useMutation(api.payments.record) });
}
function useCreateLabourTypeMutation() {
	return useMutation$1({ mutationFn: useMutation(api.labourTypes.create) });
}
function useUpdateLabourTypeMutation() {
	return useMutation$1({ mutationFn: useMutation(api.labourTypes.update) });
}
function useRemoveLabourTypeMutation() {
	return useMutation$1({ mutationFn: useMutation(api.labourTypes.remove) });
}
var appointmentQueries = {
	list: (date) => convexQuery(api.appointments.list, { date }),
	listRange: (startDate, endDate, status) => convexQuery(api.appointments.listRange, {
		startDate,
		endDate,
		status
	}),
	upcoming: () => convexQuery(api.appointments.upcoming, {}),
	get: (appointmentId) => convexQuery(api.appointments.get, { appointmentId })
};
var leadQueries = {
	list: () => convexQuery(api.leads.list, {}),
	search: (q) => convexQuery(api.leads.search, { q }),
	get: (leadId) => convexQuery(api.leads.get, { leadId })
};
var salesOrderQueries = {
	list: () => convexQuery(api.salesOrders.list, {}),
	get: (salesOrderId) => convexQuery(api.salesOrders.get, { salesOrderId }),
	byVehicle: (vehicleId) => convexQuery(api.salesOrders.byVehicle, { vehicleId }),
	byLead: (leadId) => convexQuery(api.salesOrders.byLead, { leadId })
};
var deliveryQueries = {
	get: (deliveryId) => convexQuery(api.deliveries.get, { deliveryId }),
	getBySalesOrder: (salesOrderId) => convexQuery(api.deliveries.getBySalesOrder, { salesOrderId })
};
function useCreateAppointmentMutation() {
	return useMutation$1({ mutationFn: useMutation(api.appointments.create) });
}
function useMarkAppointmentCheckedInMutation() {
	return useMutation$1({ mutationFn: useMutation(api.appointments.markCheckedIn) });
}
function useCancelAppointmentMutation() {
	return useMutation$1({ mutationFn: useMutation(api.appointments.cancel) });
}
function useCreateLeadMutation() {
	return useMutation$1({ mutationFn: useMutation(api.leads.create) });
}
function useUpdateLeadStageMutation() {
	return useMutation$1({ mutationFn: useMutation(api.leads.updateStage) });
}
function useLogFollowUpMutation() {
	return useMutation$1({ mutationFn: useMutation(api.leads.logFollowUp) });
}
function useCompleteSalesOrderMutation() {
	return useMutation$1({ mutationFn: useMutation(api.salesOrders.complete) });
}
function useCancelSalesOrderMutation() {
	return useMutation$1({ mutationFn: useMutation(api.salesOrders.cancel) });
}
function useCompleteDeliveryMutation() {
	return useMutation$1({ mutationFn: useMutation(api.deliveries.complete) });
}
function useCreatePartMutation() {
	return useMutation$1({ mutationFn: useMutation(api.parts.createPart) });
}
function useUpdatePartMutation() {
	return useMutation$1({ mutationFn: useMutation(api.parts.updatePart) });
}
function useAdjustStockMutation() {
	return useMutation$1({ mutationFn: useMutation(api.parts.adjustStock) });
}
function useImportPartsMutation() {
	return useMutation$1({ mutationFn: useMutation(api.parts.importParts) });
}
function useSetVatRateMutation() {
	return useMutation$1({ mutationFn: useMutation(api.settings.setVatRate) });
}
//#endregion
export { api, appointmentQueries, customerQueries, deliveryQueries, jobQueries, labourTypeQueries, leadQueries, partQueries, salesOrderQueries, settingsQueries, useAddJobItemMutation, useAdjustStockMutation, useApproveInvoiceMutation, useAssignMutation, useBootstrapFirstAdminMutation, useCancelAppointmentMutation, useCancelSalesOrderMutation, useCheckInMutation, useCompleteDeliveryMutation, useCompleteMutation, useCompleteSalesOrderMutation, useCreateAppointmentMutation, useCreateCustomerMutation, useCreateLabourTypeMutation, useCreateLeadMutation, useCreatePartMutation, useCreatePartsRequestMutation, useCreateVehicleMutation, useDiagnoseMutation, useDispatchPartsRequestMutation, useGenerateInvoiceMutation, useImportPartsMutation, useLogFollowUpMutation, useMarkAppointmentCheckedInMutation, useMarkPaidMutation, useMarkReadyMutation, useRecordPaymentMutation, useRemoveJobItemMutation, useRemoveLabourTypeMutation, useReviewPartsRequestMutation, useSetActiveMutation, useSetRoleMutation, useSetVatRateMutation, useStartWorkMutation, useUpdateLabourTypeMutation, useUpdateLeadStageMutation, useUpdatePartMutation, userQueries, vehicleQueries };
