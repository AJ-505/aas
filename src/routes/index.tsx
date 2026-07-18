import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import { Sparkline } from '~/components/Sparkline'
import {
  IconBanknote,
  IconCar,
  IconChevronRight,
  IconPlus,
  IconUsers,
  IconWrench,
} from '~/components/icons'
import { useCurrentUser } from '~/lib/auth'
import { customerQueries, jobQueries, labourTypeQueries, settingsQueries } from '~/lib/queries'
import { JOB_STATUS_LABELS, type JobStatus } from '~/lib/enums'
import { JOB_STATUS_VARIANTS } from '~/lib/status-ui'
import { formatDateTime, formatNaira } from '~/lib/format'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const DAY_MS = 86_400_000

/** Bucket timestamps into the last 7 calendar days (oldest → newest). */
function last7Days(timestamps: number[]): number[] {
  const buckets = new Array<number>(7).fill(0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (const ts of timestamps) {
    const d = new Date(ts)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((today.getTime() - d.getTime()) / DAY_MS)
    if (diff >= 0 && diff < 7) buckets[6 - diff]!++
  }
  return buckets
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  const { data: user } = useCurrentUser()
  const navigate = useNavigate()
  const { data: jobsData, isLoading } = useQuery(jobQueries.all())
  const { data: customers } = useQuery(customerQueries.search(''))
  const { data: settings } = useQuery(settingsQueries.get())
  const { data: labourTypes } = useQuery(labourTypeQueries.list())

  const jobs = (jobsData ?? []) as any[]
  const open = jobs.filter((j) => j.status !== 'completed' && j.status !== 'paid')
  const inProgress = jobs.filter((j) => j.status === 'inProgress')
  const ready = jobs.filter((j) => j.status === 'readyForPickup')
  const techsOnSite = new Set(inProgress.map((j) => j.technicianId).filter(Boolean)).size

  const weekAgo = Date.now() - 7 * DAY_MS
  const checkedInThisWeek = jobs.filter((j) => j.checkInTs >= weekAgo).length
  const checkinTrend = last7Days(jobs.map((j) => j.checkInTs as number))

  const customerList = (customers ?? []) as any[]
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const newThisMonth = customerList.filter((c) => c._creationTime >= monthStart.getTime()).length
  const customerTrend = last7Days(customerList.map((c) => c._creationTime as number))

  const recent = [...jobs].sort((a, b) => b.checkInTs - a.checkInTs)
  const canSeeFinance = user?.role === 'finance' || user?.role === 'manager' || user?.role === 'admin'

  if (isLoading) return <Loader />

  const kpis = [
    {
      label: 'Open jobs',
      value: String(open.length),
      icon: IconWrench,
      foot: checkedInThisWeek > 0 ? `+${checkedInThisWeek} this week` : 'No check-ins this week',
      trend: checkinTrend,
    },
    {
      label: 'In progress',
      value: String(inProgress.length).padStart(2, '0'),
      icon: IconCar,
      foot: techsOnSite > 0 ? `${techsOnSite} technician${techsOnSite === 1 ? '' : 's'} on the floor` : 'No active work',
    },
    {
      label: 'Ready for pickup',
      value: String(ready.length).padStart(2, '0'),
      icon: IconUsers,
      foot: ready.length > 0 ? 'Awaiting collection' : 'Nothing waiting',
    },
    {
      label: 'Customers',
      value: String(customerList.length),
      icon: IconUsers,
      foot: newThisMonth > 0 ? `+${newThisMonth} this month` : 'Registered total',
      trend: customerTrend,
    },
  ]

  return (
    <div className="space-y-5">
      {/* page head */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{open.length} open job{open.length === 1 ? '' : 's'} in the workshop
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link to="/service/customers" className={buttonVariants({ variant: 'outline' })}>
            Add customer
          </Link>
          <Link to="/service/checkin" className={buttonVariants()}>
            <IconPlus size={15} /> Check In Vehicle
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,18,34,0.07)]"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent">
                <k.icon size={15} />
              </span>
              <span className="text-xs font-semibold text-mute">{k.label}</span>
            </div>
            <div className="mt-2.5 flex items-end justify-between gap-2">
              <span className="text-[25px] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
                {k.value}
              </span>
              {k.trend && <Sparkline data={k.trend} />}
            </div>
            <div className="mt-2 text-[11.5px] font-semibold text-emerald-600">{k.foot}</div>
          </Card>
        ))}
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* active jobs */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Active jobs
              <span className="rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {open.length}
              </span>
            </CardTitle>
            <Link
              to="/service/jobs"
              className="flex items-center gap-1 text-[12.5px] font-semibold text-accent hover:text-accent-deep"
            >
              View all <IconChevronRight size={13} />
            </Link>
          </CardHeader>
          {recent.length === 0 ? (
            <p className="px-[18px] py-10 text-center text-[13px] text-mute">
              No jobs yet — check in the first vehicle of the day.
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line-soft bg-[#fbfbfc] text-left">
                    <th className="h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute">Status</th>
                    <th className="h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute">Vehicle</th>
                    <th className="h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute">Customer</th>
                    <th className="hidden h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute lg:table-cell">Complaint</th>
                    <th className="hidden h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute md:table-cell">Checked in</th>
                    <th className="h-9 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(0, 8).map((job) => (
                    <tr
                      key={job._id}
                      className="cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-[#f8f9fc]"
                      onClick={() => navigate({ to: '/service/job/$id', params: { id: job._id } })}
                    >
                      <td className="whitespace-nowrap px-[18px] py-3">
                        <Badge dot variant={JOB_STATUS_VARIANTS[job.status as JobStatus] ?? 'secondary'}>
                          {JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3">
                        <div className="font-semibold text-ink">
                          {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : '—'}
                        </div>
                        {job.vehicle?.plate && (
                          <div className="text-[11px] tracking-wide text-mute">{job.vehicle.plate.toUpperCase()}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-[18px] py-3">
                        {job.customer ? (
                          <span className="flex items-center gap-2 font-medium text-ink">
                            <Avatar name={job.customer.name} size={24} />
                            {job.customer.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="hidden max-w-[220px] truncate px-[18px] py-3 text-mute lg:table-cell">
                        {job.complaint}
                      </td>
                      <td className="hidden whitespace-nowrap px-[18px] py-3 text-[12.5px] text-mute md:table-cell">
                        {formatDateTime(job.checkInTs)}
                      </td>
                      <td className="px-2 text-mute">
                        <IconChevronRight size={15} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* right rail */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent check-ins</CardTitle>
              <Link to="/service/jobs" className="text-[12.5px] font-semibold text-accent hover:text-accent-deep">
                All jobs
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              {recent.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-mute">Nothing checked in yet.</p>
              ) : (
                recent.slice(0, 5).map((job) => (
                  <Link
                    key={job._id}
                    to="/service/job/$id"
                    params={{ id: job._id }}
                    className="flex items-center gap-3 border-b border-line-soft py-2.5 last:border-0"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                      <IconCar size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : 'Vehicle'}
                        {job.customer ? ` — ${job.customer.name}` : ''}
                      </span>
                      <span className="block text-[11.5px] text-mute">{formatDateTime(job.checkInTs)}</span>
                    </span>
                    <IconChevronRight size={14} className="shrink-0 text-mute" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {canSeeFinance && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Finance snapshot</CardTitle>
                <Link to="/service/finance" className="text-[12.5px] font-semibold text-accent hover:text-accent-deep">
                  Open
                </Link>
              </CardHeader>
              <CardContent className="space-y-1 pt-3">
                <div className="flex items-center justify-between py-1 text-[13px]">
                  <span className="text-body">VAT rate</span>
                  <span className="font-bold text-ink [font-variant-numeric:tabular-nums]">
                    {settings?.vatRate ?? 7.5}%
                  </span>
                </div>
                {(labourTypes ?? []).slice(0, 3).map((lt: any) => (
                  <div key={lt._id} className="flex items-center justify-between py-1 text-[13px]">
                    <span className="text-body">{lt.name}</span>
                    <span className="font-bold text-ink [font-variant-numeric:tabular-nums]">
                      {formatNaira(lt.fixedPrice)}
                    </span>
                  </div>
                ))}
                {(!labourTypes || labourTypes.length === 0) && (
                  <p className="py-1 text-[12.5px] text-mute">No labour types configured yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1 pt-2">
              <QuickLink to="/service/customers" label="Customers" note="Directory & vehicles" />
              <QuickLink to="/service/jobs" label="Workshop jobs" note="Board & check-in" />
              {user?.role === 'admin' && (
                <QuickLink to="/admin/users" label="User management" note="Roles & access" />
              )}
              <span className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-mute">
                <span className="flex items-center gap-2.5">
                  <IconBanknote size={15} />
                  Vehicle sales
                </span>
                <Badge variant="secondary">Phase 4</Badge>
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ to, label, note }: { to: string; label: string; note: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium text-body',
        'transition-colors hover:bg-[#f3f4f8] hover:text-ink',
      )}
    >
      <span>
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-[11.5px] text-mute">{note}</span>
      </span>
      <IconChevronRight size={14} className="text-mute" />
    </Link>
  )
}
