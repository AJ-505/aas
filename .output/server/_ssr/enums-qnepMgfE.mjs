//#region node_modules/.nitro/vite/services/ssr/assets/enums-qnepMgfE.js
var ROLES = [
	"admin",
	"csr",
	"technician",
	"inventoryManager",
	"finance",
	"manager",
	"salesRep"
];
var JOB_STATUSES = [
	"checkedIn",
	"assigned",
	"diagnosed",
	"waitingRelease",
	"inProgress",
	"readyForPickup",
	"completed",
	"paid"
];
var ROLE_LABELS = {
	admin: "Admin",
	csr: "Customer Service Rep",
	technician: "Technician",
	inventoryManager: "Inventory Manager",
	finance: "Finance Personnel",
	manager: "Manager",
	salesRep: "Sales Representative"
};
var JOB_STATUS_LABELS = {
	checkedIn: "Checked In",
	assigned: "Assigned",
	diagnosed: "Diagnosed",
	waitingRelease: "Waiting Release",
	inProgress: "In Progress",
	readyForPickup: "Ready for Pickup",
	completed: "Completed",
	paid: "Paid"
};
var VEHICLE_STATUS_LABELS = {
	inStock: "In Stock",
	reserved: "Reserved",
	sold: "Sold",
	customerOwned: "Customer Owned"
};
var PARTS_REQUEST_STATUS_LABELS = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	dispatched: "Dispatched"
};
var JOB_ITEM_TYPE_LABELS = {
	part: "Part",
	labour: "Labour"
};
//#endregion
export { JOB_ITEM_TYPE_LABELS, JOB_STATUSES, JOB_STATUS_LABELS, PARTS_REQUEST_STATUS_LABELS, ROLES, ROLE_LABELS, VEHICLE_STATUS_LABELS };
