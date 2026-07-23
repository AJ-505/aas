import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { IconChevronRight, IconPlus, IconX } from '~/components/icons'
import {
  appointmentQueries,
  useCreateAppointmentMutation,
  useCancelAppointmentMutation,
  useMarkAppointmentCheckedInMutation,
  customerQueries,
  useCheckInMutation,
  useCreateCustomerMutation,
  useCreateVehicleMutation,
} from '~/lib/queries'
import type { Doc, Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/appointments')({
  component: AppointmentsPage,
})

const APPOINTMENT_STATUS_VARIANTS: Record<string, 'info' | 'success' | 'destructive'> = {
  scheduled: 'info',
  checkedIn: 'success',
  cancelled: 'destructive',
}

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  checkedIn: 'Checked In',
  cancelled: 'Cancelled',
}

type RangePreset = 'today' | 'week' | 'month'

function getRange(preset: RangePreset): { startDate: number; endDate: number } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const start = now.getTime()
  if (preset === 'today') return { startDate: start, endDate: start + 86_400_000 }
  if (preset === 'week') return { startDate: start, endDate: start + 7 * 86_400_000 }
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return { startDate: start, endDate: nextMonth.getTime() }
}

const RANGE_LABELS: Record<RangePreset, string> = { today: 'Today', week: 'This Week', month: 'This Month' }

type AppointmentGroup = { date: string; ts: number; items: Doc<'appointments'>[] }

function groupByDay(appointments: Doc<'appointments'>[]): AppointmentGroup[] {
  const groups: AppointmentGroup[] = []
  for (const a of appointments) {
    const dayKey = new Date(a.appointmentTs).toDateString()
    const dayTs = new Date(a.appointmentTs)
    dayTs.setHours(0, 0, 0, 0)
    const existing = groups[groups.length - 1]
    if (existing && existing.date === dayKey) {
      existing.items.push(a)
    } else {
      groups.push({ date: dayKey, ts: dayTs.getTime(), items: [a] })
    }
  }
  return groups
}

function AppointmentsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [preset, setPreset] = useState<RangePreset>('week')
  const [showCreate, setShowCreate] = useState(false)

  const { startDate, endDate } = getRange(preset)
  const { data: appointments, isLoading } = useQuery(appointmentQueries.listRange(startDate, endDate))

  const dayGroups = appointments ? groupByDay(appointments) : []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Appointments</h1>
          <p className="mt-1 text-[13px] text-mute">
            {appointments ? `${appointments.length} upcoming` : 'Manage service appointments.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-0.5">
            {(Object.keys(RANGE_LABELS) as RangePreset[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  preset === key ? 'bg-accent text-white' : 'text-mute hover:text-ink'
                }`}
                onClick={() => setPreset(key)}
              >
                {RANGE_LABELS[key]}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <IconPlus size={15} /> Book appointment
          </Button>
        </div>
      </div>

      {showCreate && (
        <CreateAppointmentForm
          onDone={() => {
            setShowCreate(false)
            void queryClient.invalidateQueries()
          }}
        />
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Complaint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !appointments || appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No appointments in this range.
                </TableCell>
              </TableRow>
            ) : (
              dayGroups.flatMap((group) => [
                <TableRow key={group.date} className="bg-line-soft/40">
                  <TableCell colSpan={7} className="py-2 pl-4 text-[12px] font-semibold text-mute">
                    {new Date(group.date).toLocaleDateString('en-NG', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                      year: group.ts < Date.now() - 6 * 86_400_000 || group.ts > Date.now() + 6 * 86_400_000 ? 'numeric' : undefined,
                    })}
                    {' — '}{group.items.length} appointment{group.items.length !== 1 ? 's' : ''}
                  </TableCell>
                </TableRow>,
                ...group.items.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="whitespace-nowrap font-semibold text-ink">
                      {new Date(a.appointmentTs).toLocaleTimeString('en-NG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-body">{a.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-mute">{a.phone}</TableCell>
                    <TableCell className="text-body">
                      {[a.vehicleMake, a.vehicleModel, a.vehiclePlate].filter(Boolean).join(' ') || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-mute">{a.complaint ?? '-'}</TableCell>
                    <TableCell>
                      <Badge dot variant={APPOINTMENT_STATUS_VARIANTS[a.status] ?? 'secondary'}>
                        {APPOINTMENT_STATUS_LABELS[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                    {a.status === 'scheduled' && (
                      <div className="flex gap-1">
                        <AppointmentCheckInButton
                          appointment={a}
                          onDone={() => void queryClient.invalidateQueries()}
                        />
                        <CancelButton
                          appointmentId={a._id}
                          onDone={() => void queryClient.invalidateQueries()}
                        />
                      </div>
                    )}
                    {a.status === 'checkedIn' && a.checkInJobId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate({
                            to: '/service/job/$id',
                            params: { id: a.checkInJobId! },
                          })
                        }
                      >
                        View job <IconChevronRight size={13} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ])
          )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function AppointmentCheckInButton({
  appointment,
  onDone,
}: {
  appointment: { _id: string; name: string; phone: string; vehicleMake?: string; vehicleModel?: string; vehiclePlate?: string; complaint?: string }
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const checkIn = useCheckInMutation()
  const markCheckedIn = useMarkAppointmentCheckedInMutation()
  const createCustomer = useCreateCustomerMutation()
  const createVehicle = useCreateVehicleMutation()
  const queryClient = useQueryClient()

  async function handleCheckIn() {
    setLoading(true)
    try {
      const customers = await queryClient.fetchQuery(customerQueries.search(appointment.phone))

      let customerId: string
      if (customers && customers.length > 0) {
        customerId = customers[0]!._id
      } else {
        customerId = await createCustomer.mutateAsync({
          name: appointment.name,
          phone: appointment.phone,
        })
      }

      const hasVehicle = !!(appointment.vehicleMake && appointment.vehicleModel)
      let vehicleId: string | null = null

      if (hasVehicle) {
        vehicleId = await createVehicle.mutateAsync({
          ownerId: customerId as Id<'customers'>,
          make: appointment.vehicleMake!,
          model: appointment.vehicleModel!,
          year: new Date().getFullYear(),
          color: 'N/A',
          plate: appointment.vehiclePlate || undefined,
          status: 'customerOwned',
        })
      }

      if (vehicleId && appointment.complaint) {
        const jobId = await checkIn.mutateAsync({
          vehicleId: vehicleId as Id<'vehicles'>,
          customerId: customerId as Id<'customers'>,
          complaint: appointment.complaint,
        })

        await markCheckedIn.mutateAsync({
          appointmentId: appointment._id as Id<'appointments'>,
          jobId: jobId as Id<'jobs'>,
        })
      }

      toast.success('Appointment checked in.')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="default" size="sm" onClick={handleCheckIn} disabled={loading}>
      {loading ? '...' : 'Check in'}
    </Button>
  )
}

function CancelButton({ appointmentId, onDone }: { appointmentId: string; onDone: () => void }) {
  const cancel = useCancelAppointmentMutation()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await cancel.mutateAsync({ appointmentId: appointmentId as Id<'appointments'> })
        toast.success('Appointment cancelled.')
        onDone()
      }}
      disabled={cancel.isPending}
    >
      <IconX size={14} />
    </Button>
  )
}

function CreateAppointmentForm({ onDone }: { onDone: () => void }) {
  const create = useCreateAppointmentMutation()
  const todayStr = new Date().toLocaleDateString('en-CA')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = (f.get('name') as string).trim()
    const phone = (f.get('phone') as string).trim()
    const email = (f.get('email') as string).trim()
    const vehicleMake = (f.get('vehicleMake') as string).trim()
    const vehicleModel = (f.get('vehicleModel') as string).trim()
    const vehiclePlate = (f.get('vehiclePlate') as string).trim()
    const complaint = (f.get('complaint') as string).trim()
    const dateStr = f.get('date') as string
    const timeStr = f.get('time') as string

    if (!name || !phone) {
      toast.error('Name and phone are required.')
      return
    }
    if (!vehicleMake || !vehicleModel || !vehiclePlate || !complaint) {
      toast.error('Vehicle details (make, model, plate) and complaint are required.')
      return
    }
    if (!dateStr || !timeStr) {
      toast.error('Date and time are required.')
      return
    }
    const appointmentTs = new Date(`${dateStr}T${timeStr}`).getTime()
    if (isNaN(appointmentTs)) {
      toast.error('Invalid date or time.')
      return
    }
    if (appointmentTs < Date.now() - 60_000) {
      toast.error('Appointment date cannot be in the past.')
      return
    }

    await create.mutateAsync(
      {
        name,
        phone,
        email: email || undefined,
        vehicleMake,
        vehicleModel,
        vehiclePlate,
        complaint,
        appointmentTs,
      },
      {
        onSuccess: () => {
          toast.success('Appointment booked.')
          onDone()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Book appointment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2" />
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" min={todayStr} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input id="time" name="time" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleMake">Vehicle make *</Label>
            <Input id="vehicleMake" name="vehicleMake" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Vehicle model *</Label>
            <Input id="vehicleModel" name="vehicleModel" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehiclePlate">Plate *</Label>
            <Input id="vehiclePlate" name="vehiclePlate" required />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="complaint">Complaint *</Label>
            <Textarea id="complaint" name="complaint" rows={2} required />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Booking...' : 'Book appointment'}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
