import { useState, useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { buttonVariants } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import { IconChevronRight, IconPlus, IconSearch } from '~/components/icons'
import { useCurrentUser } from '~/lib/auth'
import { jobQueries } from '~/lib/queries'
import { JOB_STATUSES, JOB_STATUS_LABELS, type JobStatus } from '~/lib/enums'
import { JOB_STATUS_VARIANTS } from '~/lib/status-ui'
import { formatDateTime } from '~/lib/format'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/service/jobs')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: JobsBoardPage,
})

function JobsBoardPage() {
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || '')
  const [statusFilter, setStatusFilter] = useState<JobStatus | undefined>()
  const { data, isLoading } = useQuery(jobQueries.all())
  const { data: user } = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q)
    }
  }, [searchParams.q])

  const jobs = (data ?? []) as any[]

  // Filter jobs by search query text
  const searchedJobs = jobs.filter((j) => {
    if (!q.trim()) return true
    const term = q.toLowerCase().trim()
    const vehicleMatch =
      j.vehicle?.make?.toLowerCase().includes(term) ||
      j.vehicle?.model?.toLowerCase().includes(term) ||
      j.vehicle?.plate?.toLowerCase().includes(term)
    const customerMatch =
      j.customer?.name?.toLowerCase().includes(term) ||
      j.customer?.phone?.toLowerCase().includes(term)
    const complaintMatch = j.complaint?.toLowerCase().includes(term)
    return vehicleMatch || customerMatch || complaintMatch
  })

  const visible = statusFilter
    ? searchedJobs.filter((j) => j.status === statusFilter)
    : searchedJobs

  const countFor = (s: JobStatus) => searchedJobs.filter((j) => j.status === s).length
  const canCheckIn = ['csr', 'manager', 'admin'].includes(user?.role ?? '')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Workshop jobs</h1>
          <p className="mt-1 text-[13px] text-mute">Track every vehicle through the workshop.</p>
        </div>
        {canCheckIn && (
          <Link to="/service/checkin" className={buttonVariants()}>
            <IconPlus size={15} /> Check In Vehicle
          </Link>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search jobs by plate, vehicle, customer or complaint..."
          value={q}
          onChange={(e) => {
            const val = e.target.value
            setQ(val)
            void navigate({
              to: '/service/jobs',
              search: (prev) => ({ ...prev, q: val || undefined }),
              replace: true,
            })
          }}
          className="pl-9"
        />
      </div>

      {/* filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={statusFilter === undefined}
          label="All"
          count={searchedJobs.length}
          onClick={() => setStatusFilter(undefined)}
        />
        {JOB_STATUSES.map((s) => {
          const count = countFor(s)
          if (count === 0) return null
          return (
            <FilterChip
              key={s}
              active={statusFilter === s}
              label={JOB_STATUS_LABELS[s]}
              count={count}
              onClick={() => setStatusFilter(s)}
            />
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Complaint</TableHead>
              <TableHead className="hidden md:table-cell">Checked in</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-mute">
                  No jobs found{statusFilter ? ` with status “${JOB_STATUS_LABELS[statusFilter]}”` : ''}{q ? ` matching "${q}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((job) => (
                <TableRow
                  key={job._id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/service/job/$id', params: { id: job._id } })}
                >
                  <TableCell className="whitespace-nowrap">
                    <Badge dot variant={JOB_STATUS_VARIANTS[job.status as JobStatus] ?? 'secondary'}>
                      {JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-semibold text-ink">
                      {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model} (${job.vehicle.year})` : '-'}
                    </div>
                    {job.vehicle?.plate && (
                      <div className="text-[11px] tracking-wide text-mute">{job.vehicle.plate.toUpperCase()}</div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {job.customer ? (
                      <span className="flex items-center gap-2">
                        <Avatar name={job.customer.name} size={24} />
                        <span>
                          <span className="block font-medium text-ink">{job.customer.name}</span>
                          <span className="block text-[11px] text-mute">{job.customer.phone}</span>
                        </span>
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden max-w-[240px] truncate text-mute lg:table-cell">
                    {job.complaint}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-[12.5px] text-mute md:table-cell">
                    {formatDateTime(job.checkInTs)}
                  </TableCell>
                  <TableCell className="px-2 text-mute">
                    <IconChevronRight size={15} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
        active
          ? 'border-accent/50 bg-accent-soft text-accent-deep'
          : 'border-line bg-surface text-mute hover:border-ink/15 hover:text-body',
      )}
    >
      {label}
      <span className={cn('text-[11px]', active ? 'text-accent-deep' : 'text-mute')}>{count}</span>
    </button>
  )
}
