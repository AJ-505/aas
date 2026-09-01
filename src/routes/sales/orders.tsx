import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useCurrentUser } from '~/lib/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { FieldError, zodToFormikValidate } from '~/lib/formik-helpers'
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
import { IconChevronRight, IconPlus, IconSearch } from '~/components/icons'
import {
  salesOrderQueries,
  vehicleQueries,
  leadQueries,
  useCreateSalesOrderMutation,
} from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/orders')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: SalesOrdersPage,
})

const ORDER_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

function SalesOrdersPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()

  if (user?.role && user.role !== 'audit' && !['salesRep', 'manager', 'admin'].includes(user.role)) {
    return <Navigate to="/" />
  }

  const canEdit =
    user?.role === 'salesRep' ||
    user?.role === 'manager' ||
    user?.role === 'admin'

  const [q, setQ] = useState(searchParams.q || '')
  const { data: orders, isLoading } = useQuery(salesOrderQueries.list())
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q)
    }
  }, [searchParams.q])

  const searchedOrders = (orders ?? []).filter((o: any) => {
    if (!q.trim()) return true
    const term = q.toLowerCase().trim()
    return (
      o.lead?.name?.toLowerCase().includes(term) ||
      o.lead?.phone?.toLowerCase().includes(term) ||
      o.vehicle?.make?.toLowerCase().includes(term) ||
      o.vehicle?.model?.toLowerCase().includes(term) ||
      o.vehicle?.plate?.toLowerCase().includes(term) ||
      o.status?.toLowerCase().includes(term) ||
      o._id.toLowerCase().includes(term)
    )
  })

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

      <div className="relative max-w-md">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search orders by customer, vehicle, ID or status..."
          value={q}
          onChange={(e) => {
            const val = e.target.value
            setQ(val)
            void navigate({
              to: '/sales/orders',
              search: (prev) => ({ ...prev, q: val || undefined }),
              replace: true,
            })
          }}
          className="pl-9"
        />
      </div>

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
            ) : !searchedOrders || searchedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No sales orders found{q ? ` matching "${q}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              searchedOrders.map((o) => (
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

  const orderSchema = z.object({
    vehicleId: z.string().min(1, "Vehicle is required"),
    leadId: z.string().min(1, "Customer lead is required"),
    depositNaira: z.string().trim().optional().or(z.literal("")).refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), { message: "Deposit must be >=0" }),
  }).superRefine((v, ctx) => {
    const veh = vehicles.find((x: any) => x._id === v.vehicleId)
    if (veh?.sellingPrice) {
      const agreed = veh.sellingPrice / 100
      const dep = v.depositNaira ? Number(v.depositNaira) : 0
      if (dep > agreed) ctx.addIssue({ code: "custom", path: ["depositNaira"], message: "Deposit cannot exceed agreed price." })
    }
  })

  const formik = useFormik({
    initialValues: { vehicleId: '', leadId: initialLeadId ?? '', depositNaira: '' },
    enableReinitialize: true,
    validate: zodToFormikValidate(orderSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      const veh = vehicles.find((x: any) => x._id === values.vehicleId)
      const agreedPrice = veh?.sellingPrice ?? 0
      if (!agreedPrice || agreedPrice <= 0) { toast.error('Please enter a valid agreed price.'); setSubmitting(false); return; }
      const deposit = values.depositNaira ? Math.round(parseFloat(values.depositNaira) * 100) : 0
      if (deposit > agreedPrice) { toast.error('Deposit cannot exceed agreed price.'); setSubmitting(false); return; }
      try {
        await createOrder.mutateAsync({ vehicleId: values.vehicleId as Id<'vehicles'>, leadId: values.leadId as Id<'leads'>, agreedPrice, deposit })
        toast.success('Sales order created successfully.')
        void queryClient.invalidateQueries()
        onDone()
      } catch (err: any) { toast.error(err?.message ?? "Failed"); }
      finally { setSubmitting(false) }
    },
  })

  const selectedVeh = vehicles.find((v: any) => v._id === formik.values.vehicleId)
  const agreedPriceNaira = selectedVeh?.sellingPrice ? (selectedVeh.sellingPrice / 100).toString() : ''

  function handleVehicleSelect(selectedId: string) {
    formik.setFieldValue('vehicleId', selectedId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="order-vehicle">Vehicle (In Stock) *</Label>
              <select id="order-vehicle" name="vehicleId" value={formik.values.vehicleId} onChange={(e) => handleVehicleSelect(e.target.value)} onBlur={formik.handleBlur} className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink" aria-invalid={!!(formik.touched.vehicleId && formik.errors.vehicleId)}>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v: any) => (
                  <option key={v._id} value={v._id}>
                    {v.make} {v.model} ({v.year}) - NGN{' '}
                    {v.sellingPrice ? (v.sellingPrice / 100).toLocaleString() : 'N/A'}
                  </option>
                ))}
              </select>
              <FieldError touched={formik.touched.vehicleId} error={formik.errors.vehicleId} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="order-lead">Customer Lead *</Label>
              <select id="order-lead" name="leadId" value={formik.values.leadId} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink" aria-invalid={!!(formik.touched.leadId && formik.errors.leadId)}>
                <option value="">-- Select Lead --</option>
                {leads.map((l: any) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.phone}) - {l.stage.toUpperCase()}
                  </option>
                ))}
              </select>
              <FieldError touched={formik.touched.leadId} error={formik.errors.leadId} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="order-deposit">Initial Deposit Paid (NGN)</Label>
              <Input id="order-deposit" name="depositNaira" type="number" step="0.01" value={formik.values.depositNaira} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 1000000" aria-invalid={!!(formik.touched.depositNaira && formik.errors.depositNaira)} />
              <FieldError touched={formik.touched.depositNaira} error={formik.errors.depositNaira} />
            </div>
          </div>

          {formik.values.vehicleId && (
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
            <Button type="submit" disabled={createOrder.isPending || formik.isSubmitting}>
              {createOrder.isPending || formik.isSubmitting ? 'Creating Order...' : 'Create Sales Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

