import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import { jobQueries } from '~/lib/queries'
import { JOB_STATUSES, JOB_STATUS_LABELS, type JobStatus } from '~/lib/enums'
import { formatDateTime } from '~/lib/format'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/service/jobs')({
  component: JobsBoardPage,
})

const STATUS_VARIANTS: Record<JobStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  checkedIn: 'warning',
  assigned: 'secondary',
  diagnosed: 'secondary',
  waitingRelease: 'warning',
  inProgress: 'default',
  readyForPickup: 'success',
  completed: 'secondary',
  paid: 'success',
}

function JobsBoardPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | undefined>()
  const { data: jobs, isLoading } = useQuery(jobQueries.all(statusFilter))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workshop Jobs</h1>
          <p className="text-sm text-slate-500">Track every vehicle through the workshop.</p>
        </div>
        <Link to="/service/checkin">
          <Button>Check In Vehicle</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        {JOB_STATUSES.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {JOB_STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Complaint</TableHead>
              <TableHead>Checked In</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !jobs || jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <JobRow key={job._id} job={job} />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function JobRow({ job }: { job: any }) {
  return (
    <TableRow>
      <TableCell>
        <Badge variant={STATUS_VARIANTS[job.status as JobStatus] ?? 'secondary'}>
          {JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">
        {job.vehicle ? (
          <span>
            {job.vehicle.make} {job.vehicle.model} ({job.vehicle.year})
            {job.vehicle.plate && (
              <span className="ml-1 text-slate-500">[{job.vehicle.plate.toUpperCase()}]</span>
            )}
          </span>
        ) : '—'}
      </TableCell>
      <TableCell>
        {job.customer ? (
          <div>
            <div>{job.customer.name}</div>
            <div className="text-xs text-slate-500">{job.customer.phone}</div>
          </div>
        ) : '—'}
      </TableCell>
      <TableCell className="max-w-xs truncate text-slate-600">
        {job.complaint}
      </TableCell>
      <TableCell className="text-sm text-slate-500">
        {formatDateTime(job.checkInTs)}
      </TableCell>
      <TableCell>
        <Link
          to="/service/job/$id"
          params={{ id: job._id }}
          className="text-sm font-medium text-slate-900 underline"
        >
          View
        </Link>
      </TableCell>
    </TableRow>
  )
}
