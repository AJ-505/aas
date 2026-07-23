import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCurrentUser } from '~/lib/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Loader } from '~/components/Loader'
import { IconChevronRight, IconPlus } from '~/components/icons'
import {
  salesOrderQueries,
  vehicleQueries,
  leadQueries,
  useCreateSalesOrderMutation,
} from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/orders')({
  component: SalesOrdersPage,
})

const ORDER_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

function SalesOrdersPage() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const canEdit =
    user?.role === 'salesRep' ||
    user?.role === 'manager' ||
    user?.role === 'admin' ||
    user?.role === 'csr'

  const { data: orders, isLoading } = useQuery(salesOrderQueries.list())
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Sales Orders</h1>
          <p className="mt-1 text-[13px] text-mute">
            {orders ? `${orders.length} orders` : 'Track vehicle sales.'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreate(true)}>
            <IconPlus size={15} /> New Sales Order
          </Button>
        )}
      </div>

      {showCreate && <CreateSalesOrderModal onDone={() => setShowCreate(false)} />}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Agreed Price</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}><Loader /></TableCell>
              </TableRow>
            ) : !orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No sales orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow
                  key={o._id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/sales/order/$id', params: { id: o._id } })}
                >
                  <TableCell className="whitespace-nowrap font-semibold text-ink">
                    #{o._id.slice(-6)}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.agreedPrice / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.deposit / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.balance / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-[13px] text-mute">
                    {new Date(o.reservedTs).toLocaleDateString('en-NG')}
                  </TableCell>
                  <TableCell>
                    <Badge dot variant={ORDER_STATUS_VARIANTS[o.status] ?? 'secondary'}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </Badge>
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

export function CreateSalesOrderModal({
  initialLeadId,
  onDone,
}: {
  initialLeadId?: string
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const { data: vehiclesData } = useQuery(vehicleQueries.inventory())
  const { data: leadsData } = useQuery(leadQueries.list())
  const createOrder = useCreateSalesOrderMutation()

  const vehicles = (vehiclesData ?? []).filter((v: any) => v.status === 'inStock')
  const leads = (leadsData ?? []) as any[]

  const [vehicleId, setVehicleId] = useState('')
  const [leadId, setLeadId] = useState(initialLeadId ?? '')
  const [agreedPriceNaira, setAgreedPriceNaira] = useState('')
  const [depositNaira, setDepositNaira] = useState('')

  function handleVehicleSelect(selectedId: string) {
    setVehicleId(selectedId)
    const v = vehicles.find((item: any) => item._id === selectedId)
    if (v && v.sellingPrice) {
      setAgreedPriceNaira((v.sellingPrice / 100).toString())
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vehicleId) {
      toast.error('Please select an available vehicle in stock.')
      return
    }
    if (!leadId) {
      toast.error('Please select a customer lead.')
      return
    }
    if (!agreedPriceNaira || parseFloat(agreedPriceNaira) <= 0) {
      toast.error('Please enter a valid agreed price.')
      return
    }

    const agreedPrice = Math.round(parseFloat(agreedPriceNaira) * 100)
    const deposit = depositNaira ? Math.round(parseFloat(depositNaira) * 100) : 0

    if (deposit > agreedPrice) {
      toast.error('Deposit cannot exceed agreed price.')
      return
    }

    await createOrder.mutateAsync(
      {
        vehicleId: vehicleId as Id<'vehicles'>,
        leadId: leadId as Id<'leads'>,
        agreedPrice,
        deposit,
      },
      {
        onSuccess: () => {
          toast.success('Sales order created successfully.')
          void queryClient.invalidateQueries()
          onDone()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="order-vehicle">Vehicle (In Stock) *</Label>
              <select
                id="order-vehicle"
                value={vehicleId}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink"
                required
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v: any) => (
                  <option key={v._id} value={v._id}>
                    {v.make} {v.model} ({v.year}) - NGN{' '}
                    {v.sellingPrice ? (v.sellingPrice / 100).toLocaleString() : 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="order-lead">Customer Lead *</Label>
              <select
                id="order-lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink"
                required
              >
                <option value="">-- Select Lead --</option>
                {leads.map((l: any) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.phone}) - {l.stage.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="order-deposit">Initial Deposit Paid (NGN)</Label>
              <Input
                id="order-deposit"
                type="number"
                step="0.01"
                value={depositNaira}
                onChange={(e) => setDepositNaira(e.target.value)}
                placeholder="e.g. 1000000"
              />
            </div>
          </div>

          {vehicleId && (
            <div className="rounded-md border border-line-soft bg-surface-soft p-3 text-[13px]">
              <span className="text-mute">Fixed Vehicle Selling Price: </span>
              <strong className="text-ink">
                {agreedPriceNaira
                  ? `NGN ${parseFloat(agreedPriceNaira).toLocaleString()}`
                  : 'N/A'}
              </strong>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">

            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? 'Creating Order...' : 'Create Sales Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

