import { createFileRoute } from '@tanstack/react-router'
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
import { customerQueries, useCreateVehicleMutation } from '~/lib/queries'
import { VEHICLE_STATUS_LABELS } from '~/lib/enums'

export const Route = createFileRoute('/service/customers/$customerId')({
  component: CustomerDetailPage,
})

function CustomerDetailPage() {
  const { customerId } = Route.useParams()
  const { data, isLoading } = useQuery(customerQueries.detail(customerId))

  if (isLoading) {
    return <Loader />
  }
  if (!data) {
    return <p className="text-slate-500">Customer not found.</p>
  }
  const { customer, vehicles } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <p className="text-sm text-slate-500">{customer.phone}</p>
        {customer.email && <p className="text-sm text-slate-500">{customer.email}</p>}
        {customer.address && <p className="text-sm text-slate-500">{customer.address}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Vehicles</h2>
        <Card>
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
                  <TableCell colSpan={4} className="text-center text-slate-500">
                    No vehicles recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell className="font-medium uppercase">
                      {v.plate ?? '—'}
                    </TableCell>
                    <TableCell>
                      {v.make} {v.model} ({v.year})
                    </TableCell>
                    <TableCell>{v.color}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {VEHICLE_STATUS_LABELS[v.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

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
        ownerId: customerId,
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
      <CardHeader>
        <CardTitle>Add vehicle</CardTitle>
      </CardHeader>
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
