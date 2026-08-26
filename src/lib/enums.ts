export const ROLES = [
  'admin',
  'csr',
  'inventoryManager',
  'finance',
  'manager',
  'salesRep',
  'audit',
] as const
export type Role = (typeof ROLES)[number]

export const JOB_STATUSES = [
  'checkedIn',
  'diagnosed',
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

export const INVOICE_DOMAINS = ['service', 'sales'] as const
export type InvoiceDomain = (typeof INVOICE_DOMAINS)[number]

export const INVOICE_KINDS = ['estimate', 'final'] as const
export type InvoiceKind = (typeof INVOICE_KINDS)[number]

export const INVOICE_STATUSES = ['draft', 'approved', 'rejected', 'converted'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  csr: 'Customer Service Rep',
  inventoryManager: 'Inventory Manager',
  finance: 'Finance Personnel',
  manager: 'Manager',
  salesRep: 'Sales Representative',
  audit: 'Auditor',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  checkedIn: 'Checked In',
  diagnosed: 'Diagnosed',
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

export const JOB_ITEM_TYPE_LABELS: Record<JobItemType, string> = {
  part: 'Part',
  labour: 'Labour',
}
