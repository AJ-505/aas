// Central mapping from domain statuses to badge visual variants.

import type { JobStatus, PartsRequestStatus, VehicleStatus } from '~/lib/enums'

export type StatusVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'violet'

export const JOB_STATUS_VARIANTS: Record<JobStatus, StatusVariant> = {
  checkedIn: 'warning',
  assigned: 'info',
  diagnosed: 'violet',
  waitingRelease: 'destructive',
  inProgress: 'default',
  readyForPickup: 'success',
  completed: 'secondary',
  paid: 'success',
}

export const VEHICLE_STATUS_VARIANTS: Record<VehicleStatus, StatusVariant> = {
  inStock: 'info',
  reserved: 'warning',
  sold: 'success',
  customerOwned: 'secondary',
}

export const PARTS_REQUEST_VARIANTS: Record<PartsRequestStatus, StatusVariant> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'destructive',
  dispatched: 'success',
  reversed: 'secondary',
}
