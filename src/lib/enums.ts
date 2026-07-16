export const ROLES = [
  'admin',
  'csr',
  'technician',
  'inventoryManager',
  'finance',
  'manager',
  'salesRep',
] as const
export type Role = (typeof ROLES)[number]

export const JOB_STATUSES = [
  'checkedIn',
  'assigned',
  'diagnosed',
  'waitingRelease',
  'inProgress',
  'readyForPickup',
  'completed',
  'paid',
] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const VEHICLE_STATUSES = [
  'inStock',
  'reserved',
  'sold',
  'customerOwned',
] as const
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]

export const PARTS_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'dispatched',
] as const
export type PartsRequestStatus = (typeof PARTS_REQUEST_STATUSES)[number]

export const LEAD_STAGES = ['new', 'contacted', 'qualified', 'lost', 'won'] as const
export type LeadStage = (typeof LEAD_STAGES)[number]

export const SALES_ORDER_STATUSES = [
  'pending',
  'completed',
  'cancelled',
] as const
export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number]

export const STOCK_MOVEMENT_TYPES = ['in', 'out', 'adjust'] as const
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number]

export const JOB_ITEM_TYPES = ['part', 'labour'] as const
export type JobItemType = (typeof JOB_ITEM_TYPES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  csr: 'Customer Service Rep',
  technician: 'Technician',
  inventoryManager: 'Inventory Manager',
  finance: 'Finance Personnel',
  manager: 'Manager',
  salesRep: 'Sales Representative',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  checkedIn: 'Checked In',
  assigned: 'Assigned',
  diagnosed: 'Diagnosed',
  waitingRelease: 'Waiting Release',
  inProgress: 'In Progress',
  readyForPickup: 'Ready for Pickup',
  completed: 'Completed',
  paid: 'Paid',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  inStock: 'In Stock',
  reserved: 'Reserved',
  sold: 'Sold',
  customerOwned: 'Customer Owned',
}
