import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'
import {
  JOB_STATUSES,
  JOB_ITEM_TYPES,
  LEAD_STAGES,
  PARTS_REQUEST_STATUSES,
  ROLES,
  SALES_ORDER_STATUSES,
  STOCK_MOVEMENT_TYPES,
  VEHICLE_STATUSES,
} from '../src/lib/enums'

const roleValidator = v.union(...ROLES.map((r) => v.literal(r)))
const jobStatusValidator = v.union(...JOB_STATUSES.map((s) => v.literal(s)))
const jobItemTypeValidator = v.union(...JOB_ITEM_TYPES.map((s) => v.literal(s)))
const vehicleStatusValidator = v.union(...VEHICLE_STATUSES.map((s) => v.literal(s)))
const partsRequestStatusValidator = v.union(
  ...PARTS_REQUEST_STATUSES.map((s) => v.literal(s)),
)
const stockMovementTypeValidator = v.union(
  ...STOCK_MOVEMENT_TYPES.map((s) => v.literal(s)),
)
const leadStageValidator = v.union(...LEAD_STAGES.map((s) => v.literal(s)))
const salesOrderStatusValidator = v.union(
  ...SALES_ORDER_STATUSES.map((s) => v.literal(s)),
)

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
    active: v.optional(v.boolean()),
  }).index('email', ['email']),

  // ---- Service module ----
  customers: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  })
    .index('by_phone', ['phone'])
    .searchIndex('name', { searchField: 'name' })
    .searchIndex('search_phone', { searchField: 'phone' }),

  vehicles: defineTable({
    ownerId: v.optional(v.id('customers')),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.string(),
    vin: v.optional(v.string()),
    plate: v.optional(v.string()),
    cost: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),
    status: vehicleStatusValidator,
  })
    .index('status', ['status'])
    .index('owner', ['ownerId'])
    .index('by_plate', ['plate'])
    .searchIndex('search_plate', { searchField: 'plate' }),

  jobs: defineTable({
    vehicleId: v.id('vehicles'),
    customerId: v.id('customers'),
    csrId: v.id('users'),
    technicianId: v.optional(v.id('users')),
    status: jobStatusValidator,
    complaint: v.string(),
    checkInTs: v.number(),
    assignedTs: v.optional(v.number()),
    diagnosedTs: v.optional(v.number()),
    waitingReleaseTs: v.optional(v.number()),
    inProgressTs: v.optional(v.number()),
    readyForPickupTs: v.optional(v.number()),
    completedTs: v.optional(v.number()),
    paidTs: v.optional(v.number()),
  })
    .index('status', ['status'])
    .index('technicianId', ['technicianId'])
    .index('customerId', ['customerId']),

  jobItems: defineTable({
    jobId: v.id('jobs'),
    type: jobItemTypeValidator,
    partId: v.optional(v.id('parts')),
    labourTypeId: v.optional(v.id('labourTypes')),
    qty: v.number(),
    unitPrice: v.number(),
    lineTotal: v.number(),
  }).index('jobId', ['jobId']),

  partsRequests: defineTable({
    jobId: v.id('jobs'),
    technicianId: v.id('users'),
    items: v.array(
      v.object({
        partId: v.id('parts'),
        qty: v.number(),
      }),
    ),
    status: partsRequestStatusValidator,
    reviewedByInventoryManagerId: v.optional(v.id('users')),
    reviewedTs: v.optional(v.number()),
    note: v.optional(v.string()),
  })
    .index('status', ['status'])
    .index('jobId', ['jobId']),

  invoices: defineTable({
    jobId: v.id('jobs'),
    lineItems: v.array(
      v.object({
        type: jobItemTypeValidator,
        description: v.string(),
        qty: v.number(),
        unitPrice: v.number(),
        lineTotal: v.number(),
      }),
    ),
    partsTotal: v.number(),
    labourTotal: v.number(),
    subtotal: v.number(),
    vat: v.number(),
    grandTotal: v.number(),
    approved: v.boolean(),
    approvedTs: v.optional(v.number()),
    paid: v.boolean(),
    amountPaid: v.number(),
  }).index('jobId', ['jobId']),

  labourTypes: defineTable({
    name: v.string(),
    fixedPrice: v.number(),
  }),

  parts: defineTable({
    code: v.string(),
    description: v.string(),
    costPrice: v.number(),
    sellingPrice: v.number(),
    stockQty: v.number(),
    reorderLevel: v.number(),
  })
    .index('by_code', ['code'])
    .searchIndex('search_code', { searchField: 'code' }),

  stockMovements: defineTable({
    partId: v.id('parts'),
    qty: v.number(),
    type: stockMovementTypeValidator,
    jobId: v.optional(v.id('jobs')),
    ts: v.number(),
    userId: v.id('users'),
  }).index('partId', ['partId']),

  payments: defineTable({
    invoiceId: v.id('invoices'),
    amount: v.number(),
    method: v.string(),
    ts: v.number(),
    recordedById: v.id('users'),
  }).index('invoiceId', ['invoiceId']),

  // ---- Sales module ----
  leads: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    interestedVehicleId: v.optional(v.id('vehicles')),
    stage: leadStageValidator,
    notes: v.array(
      v.object({
        text: v.string(),
        ts: v.number(),
      }),
    ),
    nextFollowUpTs: v.optional(v.number()),
  })
    .index('stage', ['stage'])
    .searchIndex('name', { searchField: 'name' })
    .searchIndex('phone', { searchField: 'phone' }),

  salesOrders: defineTable({
    vehicleId: v.id('vehicles'),
    leadId: v.id('leads'),
    agreedPrice: v.number(),
    deposit: v.number(),
    balance: v.number(),
    reservedTs: v.number(),
    status: salesOrderStatusValidator,
  })
    .index('vehicleId', ['vehicleId'])
    .index('leadId', ['leadId']),

  deliveries: defineTable({
    salesOrderId: v.id('salesOrders'),
    checklist: v.object({
      keys: v.boolean(),
      manual: v.boolean(),
      toolkit: v.boolean(),
      inspection: v.boolean(),
    }),
    handedOverTs: v.number(),
    repId: v.id('users'),
  }).index('salesOrderId', ['salesOrderId']),

  // ---- Cross-cutting ----
  auditLogs: defineTable({
    userId: v.id('users'),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    ts: v.number(),
  }).index('entityId', ['entityId']),
})
