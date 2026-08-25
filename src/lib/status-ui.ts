// Central mapping from domain statuses to badge visual variants.

import type { JobStatus, VehicleStatus } from '~/lib/enums'

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
  diagnosed: 'violet',
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
