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
import type { Id } from 'convex/_generated/dataModel'

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

function AppointmentsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [day, setDay] = useState(today.getTime())
  const [showCreate, setShowCreate] = useState(false)

  const { data: appointments, isLoading } = useQuery(appointmentQueries.list(day))

  const prevDay = () => setDay((d) => d - 86_400_000)
  const nextDay = () => setDay((d) => d + 86_400_000)
  const isToday = day === today.getTime()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Appointments</h1>
          <p className="mt-1 text-[13px] text-mute">
            {appointments ? `${appointments.length} for today` : 'Manage service appointments.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevDay}>
            &larr; Prev
          </Button>
          <span className="min-w-[140px] text-center text-[13px] font-semibold text-ink">
            {isToday
              ? 'Today'
              : new Date(day).toLocaleDateString('en-NG', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
          </span>
          <Button variant="outline" size="sm" onClick={nextDay} disabled={isToday}>
            Next &rarr;
          </Button>
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
              <TableHead>Time</TableHead>
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
                  No appointments for this day.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = (f.get('name') as string).trim()
    const phone = (f.get('phone') as string).trim()
    if (!name || !phone) {
      toast.error('Name and phone are required.')
      return
    }
    const dateStr = f.get('date') as string
    const timeStr = f.get('time') as string
    if (!dateStr || !timeStr) {
      toast.error('Date and time are required.')
      return
    }
    const appointmentTs = new Date(`${dateStr}T${timeStr}`).getTime()
    if (isNaN(appointmentTs)) {
      toast.error('Invalid date or time.')
      return
    }

    await create.mutateAsync(
      {
        name,
        phone,
        email: (f.get('email') as string).trim() || undefined,
        vehicleMake: (f.get('vehicleMake') as string).trim() || undefined,
        vehicleModel: (f.get('vehicleModel') as string).trim() || undefined,
        vehiclePlate: (f.get('vehiclePlate') as string).trim() || undefined,
        complaint: (f.get('complaint') as string).trim() || undefined,
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
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input id="time" name="time" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleMake">Vehicle make</Label>
            <Input id="vehicleMake" name="vehicleMake" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Vehicle model</Label>
            <Input id="vehicleModel" name="vehicleModel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehiclePlate">Plate</Label>
            <Input id="vehiclePlate" name="vehiclePlate" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="complaint">Complaint</Label>
            <Textarea id="complaint" name="complaint" rows={2} />
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
