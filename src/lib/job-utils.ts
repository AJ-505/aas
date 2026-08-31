import type { JobStatus } from './enums'

export type { JobStatus }

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  checkedIn: ['diagnosed', 'inProgress'],
  diagnosed: ['inProgress'],
  inProgress: ['readyForPickup'],
  readyForPickup: ['completed'],
  completed: ['paid'],
  paid: [],
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function nextStatuses(from: JobStatus): JobStatus[] {
  return TRANSITIONS[from] ?? []
}

export function isTerminal(status: JobStatus): boolean {
  return TRANSITIONS[status].length === 0
}

export function resolveJobStatusAfterInvoicePayment(jobStatus: JobStatus, invoiceFullyPaid: boolean): JobStatus {
  if (!invoiceFullyPaid || jobStatus === 'paid') return jobStatus
  if (jobStatus === 'completed') return 'paid'
  return jobStatus
}

export const JOB_FLOW: JobStatus[] = [
  'checkedIn',
  'diagnosed',
  'inProgress',
  'readyForPickup',
  'completed',
  'paid',
]

export function statusIndex(status: JobStatus): number {
  return JOB_FLOW.indexOf(status)
}

export function isBefore(a: JobStatus, b: JobStatus): boolean {
  return statusIndex(a) < statusIndex(b)
}

export function isAtOrBefore(a: JobStatus, b: JobStatus): boolean {
  return statusIndex(a) <= statusIndex(b)
}
