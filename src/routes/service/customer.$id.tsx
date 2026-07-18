import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
import { Avatar } from '~/components/Avatar'
import { IconChevronRight, IconMail, IconPhone } from '~/components/icons'
import { customerQueries, useCreateVehicleMutation } from '~/lib/queries'
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '~/lib/enums'
import { VEHICLE_STATUS_VARIANTS } from '~/lib/status-ui'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/customer/$id')({
  component: CustomerDetailPage,
})

function CustomerDetailPage() {
  const { id: customerId } = Route.useParams()
  const { data, isLoading, isError, error } = useQuery(customerQueries.detail(customerId))

  if (isLoading) {
    return <Loader />
  }
  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">Error loading customer: {error?.message ?? 'Unknown error'}</p>
        <Link to="/service/customers" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to customers
        </Link>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Customer not found.</p>
        <Link to="/service/customers" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to customers
        </Link>
      </div>
    )
  }
  const { customer, vehicles } = data

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar name={customer.name} size={52} />
          <div>
            <h1 className="text-[23px] font-extrabold tracking-tight text-ink">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-mute">
              <span className="flex items-center gap-1.5"><IconPhone size={13} /> {customer.phone}</span>
              {customer.email && <span className="flex items-center gap-1.5"><IconMail size={13} /> {customer.email}</span>}
            </div>
            {customer.address && <p className="mt-1 text-[13px] text-mute">{customer.address}</p>}
          </div>
        </div>
        <Link
          to="/service/customers"
          className="flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
        >
          <IconChevronRight size={13} className="rotate-180" /> Back to customers
        </Link>
      </div>

      {/* vehicles */}
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Vehicles</CardTitle>
          <span className="rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {vehicles.length}
          </span>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-mute">
                  No vehicles recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v._id}>
                  <TableCell className="whitespace-nowrap font-semibold uppercase tracking-wide text-ink">
                    {v.plate ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-body">
                    {v.make} {v.model} ({v.year})
                  </TableCell>
                  <TableCell className="text-body">{v.color}</TableCell>
                  <TableCell>
                    <Badge dot variant={VEHICLE_STATUS_VARIANTS[v.status as VehicleStatus] ?? 'secondary'}>
                      {VEHICLE_STATUS_LABELS[v.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddVehicleForm customerId={customerId} />
    </div>
  )
}

function AddVehicleForm({ customerId }: { customerId: string }) {
  const queryClient = useQueryClient()
  const create = useCreateVehicleMutation()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    const make = (f.get('make') as string).trim()
    const model = (f.get('model') as string).trim()
    const color = (f.get('color') as string).trim()
    const year = Number(f.get('year'))
    const plate = (f.get('plate') as string).trim()
    const vin = (f.get('vin') as string).trim()
    if (!make || !model || !color || !year) {
      toast.error('Make, model, colour and year are required.')
      return
    }
    await create.mutateAsync(
      {
        ownerId: customerId as Id<'customers'>,
        make,
        model,
        year,
        color,
        plate: plate || undefined,
        vin: vin || undefined,
        status: 'customerOwned',
      },
      {
        onSuccess: () => {
          toast.success('Vehicle added.')
          void queryClient.invalidateQueries()
          ;(event.target as HTMLFormElement).reset()
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add vehicle</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input id="make" name="make" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input id="model" name="model" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input id="year" name="year" type="number" min={1900} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Colour *</Label>
            <Input id="color" name="color" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plate">Plate</Label>
            <Input id="plate" name="plate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" name="vin" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
