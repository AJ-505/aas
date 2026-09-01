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
import { IconPlus, IconSearch } from '~/components/icons'
import {
  vehicleQueries,
  vehicleBrandQueries,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useAdjustVehicleStockMutation,
} from '~/lib/queries'
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '~/lib/enums'
import { VEHICLE_STATUS_VARIANTS } from '~/lib/status-ui'
import { cn } from '~/lib/utils'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/inventory')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: SalesInventoryPage,
})

const SALES_STATUSES: VehicleStatus[] = ['inStock', 'reserved', 'sold']

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
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold transition-colors',
        active
          ? 'bg-accent text-white'
          : 'bg-line-soft text-body hover:bg-line hover:text-ink',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.25 text-[11px]',
          active ? 'bg-white/20 text-white' : 'bg-line text-mute',
        )}
      >
        {count}
      </span>
    </button>
  )
}

function SalesInventoryPage() {
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
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | undefined>()
  const { data: vehiclesData, isLoading } = useQuery(vehicleQueries.inventory())

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q)
    }
  }, [searchParams.q])

  const [showAdd, setShowAdd] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [stockingVehicle, setStockingVehicle] = useState<any | null>(null)

  // Only vehicles for sale are shown in vehicle inventory
  const salesVehicles = (vehiclesData ?? []).filter(
    (v: any) => v.status !== 'customerOwned',
  )

  const searchedVehicles = salesVehicles.filter((v: any) => {
    if (!q.trim()) return true
    const term = q.toLowerCase().trim()
    return (
      v.make?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      String(v.year).includes(term) ||
      v.color?.toLowerCase().includes(term) ||
      v.plate?.toLowerCase().includes(term) ||
      v.vin?.toLowerCase().includes(term)
    )
  })

  const visibleVehicles = statusFilter
    ? searchedVehicles.filter((v) => v.status === statusFilter)
    : searchedVehicles
  const countFor = (status?: VehicleStatus) =>
    status ? searchedVehicles.filter((v) => v.status === status).length : searchedVehicles.length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Vehicle Inventory</h1>
          <p className="mt-1 text-[13px] text-mute">
            {salesVehicles ? `${salesVehicles.length} vehicles for sale` : 'Track vehicle stock for sale.'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAdd(true)}>
            <IconPlus size={15} /> Add Stock Vehicle
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search vehicles by make, model, year, color, plate, VIN..."
          value={q}
          onChange={(e) => {
            const val = e.target.value
            setQ(val)
            void navigate({
              to: '/sales/inventory',
              search: (prev) => ({ ...prev, q: val || undefined }),
              replace: true,
            })
          }}
          className="pl-9"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={statusFilter === undefined}
          label="All"
          count={countFor(undefined)}
          onClick={() => setStatusFilter(undefined)}
        />
        {SALES_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            label={VEHICLE_STATUS_LABELS[s]}
            count={countFor(s)}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </div>

      {showAdd && <AddVehicleModal onDone={() => setShowAdd(false)} />}
      {editingVehicle && (
        <EditVehicleModal vehicle={editingVehicle} onDone={() => setEditingVehicle(null)} />
      )}
      {stockingVehicle && (
        <StockVehicleModal vehicle={stockingVehicle} onDone={() => setStockingVehicle(null)} />
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-center">Stock Qty</TableHead>
              <TableHead className="text-center">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9}><Loader /></TableCell>
              </TableRow>
            ) : visibleVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-mute">
                  No vehicles found in this view.
                </TableCell>
              </TableRow>
            ) : (
              visibleVehicles.map((v) => {
                const stockQty = v.stockQty ?? 1
                const reorderLevel = v.reorderLevel ?? 0
                const isLowStock = stockQty <= reorderLevel

                return (
                  <TableRow key={v._id}>
                    <TableCell className="whitespace-nowrap font-semibold text-ink">
                      {v.make} {v.model}
                    </TableCell>
                    <TableCell className="text-body">{v.year}</TableCell>
                    <TableCell className="text-body">{v.color}</TableCell>
                    <TableCell className="text-right text-body">
                      {v.cost != null ? `NGN ${(v.cost / 100).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-body">
                      {v.sellingPrice != null ? `NGN ${(v.sellingPrice / 100).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-mono font-bold',
                          isLowStock ? 'text-rose-600' : 'text-ink',
                        )}
                      >
                        {stockQty}
                        {isLowStock && (
                          <span className="rounded bg-rose-100 px-1 py-0.5 text-[10px] text-rose-700 font-semibold">
                            Low
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-mute">
                      {reorderLevel}
                    </TableCell>
                    <TableCell>
                      <Badge dot variant={VEHICLE_STATUS_VARIANTS[v.status as VehicleStatus] ?? 'secondary'}>
                        {VEHICLE_STATUS_LABELS[v.status as VehicleStatus]}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingVehicle(v)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStockingVehicle(v)}
                          >
                            Stock
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function AddVehicleModal({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const createVehicle = useCreateVehicleMutation()
  const { data: brandList } = useQuery(vehicleBrandQueries.list())

  const vehicleSchema = z.object({
    make: z.string().trim().min(1, "Make is required"),
    model: z.string().trim().min(1, "Model is required"),
    year: z.string().trim().min(1, "Year is required").refine((v) => { const n = Number(v); return !isNaN(n) && n >= 1900 && n <= new Date().getFullYear() + 1; }, { message: "Year must be valid" }),
    color: z.string().trim().min(1, "Colour is required"),
    costNaira: z.string().trim().optional().or(z.literal("")).refine((v) => !v || !isNaN(Number(v)), { message: "Must be a number" }),
    sellingPriceNaira: z.string().trim().optional().or(z.literal("")).refine((v) => !v || !isNaN(Number(v)), { message: "Must be a number" }),
    stockQty: z.string().trim().min(1, "Stock qty required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, { message: "Must be >=0" }),
    reorderLevel: z.string().trim().min(1, "Reorder required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0, { message: "Must be >=0" }),
  })

  const formik = useFormik({
    initialValues: { make: '', model: '', year: '', color: '', costNaira: '', sellingPriceNaira: '', stockQty: '1', reorderLevel: '0' },
    validate: zodToFormikValidate(vehicleSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      const cost = values.costNaira ? Math.round(parseFloat(values.costNaira) * 100) : undefined
      const sellingPrice = values.sellingPriceNaira ? Math.round(parseFloat(values.sellingPriceNaira) * 100) : undefined
      try {
        await createVehicle.mutateAsync({
          make: values.make.trim(),
          model: values.model.trim(),
          year: parseInt(values.year, 10),
          color: values.color.trim(),
          cost,
          sellingPrice,
          status: 'inStock',
          stockQty: parseInt(values.stockQty, 10) || 1,
          reorderLevel: parseInt(values.reorderLevel, 10) || 0,
        })
        toast.success('Vehicle added to inventory.')
        void queryClient.invalidateQueries()
        onDone()
      } catch (err: any) { toast.error(err?.message ?? "Failed"); }
      finally { setSubmitting(false) }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Showroom Stock Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="make">Make *</Label>
              <Input id="make" name="make" value={formik.values.make} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Toyota" list="add-vehicle-brands" aria-invalid={!!(formik.touched.make && formik.errors.make)} />
              <datalist id="add-vehicle-brands">
                {(brandList ?? []).map((b: any) => <option key={b._id} value={b.name} />)}
              </datalist>
              <FieldError touched={formik.touched.make} error={formik.errors.make} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" name="model" value={formik.values.model} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Camry" aria-invalid={!!(formik.touched.model && formik.errors.model)} />
              <FieldError touched={formik.touched.model} error={formik.errors.model} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" name="year" type="number" value={formik.values.year} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 2024" aria-invalid={!!(formik.touched.year && formik.errors.year)} />
              <FieldError touched={formik.touched.year} error={formik.errors.year} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="color">Colour *</Label>
              <Input id="color" name="color" value={formik.values.color} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Silver" aria-invalid={!!(formik.touched.color && formik.errors.color)} />
              <FieldError touched={formik.touched.color} error={formik.errors.color} />
            </div>
            <div>
              <Label htmlFor="cost">Cost Price (NGN)</Label>
              <Input id="cost" name="costNaira" type="number" step="0.01" value={formik.values.costNaira} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 5000000" />
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price (NGN)</Label>
              <Input id="sellingPrice" name="sellingPriceNaira" type="number" step="0.01" value={formik.values.sellingPriceNaira} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 6500000" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stockQty">Initial Stock Qty *</Label>
              <Input id="stockQty" name="stockQty" type="number" min="0" value={formik.values.stockQty} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.stockQty && formik.errors.stockQty)} />
              <FieldError touched={formik.touched.stockQty} error={formik.errors.stockQty} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reorderLevel">Reorder Level *</Label>
              <Input id="reorderLevel" name="reorderLevel" type="number" min="0" value={formik.values.reorderLevel} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.reorderLevel && formik.errors.reorderLevel)} />
              <FieldError touched={formik.touched.reorderLevel} error={formik.errors.reorderLevel} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVehicle.isPending || formik.isSubmitting}>
              {createVehicle.isPending || formik.isSubmitting ? 'Saving...' : 'Save Stock Vehicle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function EditVehicleModal({ vehicle, onDone }: { vehicle: any; onDone: () => void }) {
  const queryClient = useQueryClient()
  const updateVehicle = useUpdateVehicleMutation()
  const { data: brandList2 } = useQuery(vehicleBrandQueries.list())

  const [make, setMake] = useState(vehicle.make ?? '')
  const [model, setModel] = useState(vehicle.model ?? '')
  const [year, setYear] = useState(vehicle.year?.toString() ?? '')
  const [color, setColor] = useState(vehicle.color ?? '')
  const [costNaira, setCostNaira] = useState(vehicle.cost != null ? (vehicle.cost / 100).toString() : '')
  const [sellingPriceNaira, setSellingPriceNaira] = useState(
    vehicle.sellingPrice != null ? (vehicle.sellingPrice / 100).toString() : '',
  )
  const [stockQty, setStockQty] = useState((vehicle.stockQty ?? 1).toString())
  const [reorderLevel, setReorderLevel] = useState((vehicle.reorderLevel ?? 0).toString())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cost = costNaira ? Math.round(parseFloat(costNaira) * 100) : undefined
    const sellingPrice = sellingPriceNaira ? Math.round(parseFloat(sellingPriceNaira) * 100) : undefined

    await updateVehicle.mutateAsync(
      {
        vehicleId: vehicle._id as Id<'vehicles'>,
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10) || vehicle.year,
        color: color.trim(),
        cost,
        sellingPrice,
        stockQty: parseInt(stockQty, 10) || 0,
        reorderLevel: parseInt(reorderLevel, 10) || 0,
      },
      {
        onSuccess: () => {
          toast.success('Vehicle details updated.')
          void queryClient.invalidateQueries()
          onDone()
        },
        onError: (err: any) => toast.error(err.message),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Vehicle - {vehicle.make} {vehicle.model}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="edit-make">Make</Label>
              <Input id="edit-make" value={make} onChange={(e) => setMake(e.target.value)} list="edit-vehicle-brands" required />
              <datalist id="edit-vehicle-brands">
                {(brandList2 ?? []).map((b: any) => <option key={b._id} value={b.name} />)}
              </datalist>
            </div>
            <div>
              <Label htmlFor="edit-model">Model</Label>
              <Input id="edit-model" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="edit-year">Year</Label>
              <Input id="edit-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="edit-color">Colour</Label>
              <Input id="edit-color" value={color} onChange={(e) => setColor(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="edit-cost">Cost Price (NGN)</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                value={costNaira}
                onChange={(e) => setCostNaira(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-sellingPrice">Selling Price (NGN)</Label>
              <Input
                id="edit-sellingPrice"
                type="number"
                step="0.01"
                value={sellingPriceNaira}
                onChange={(e) => setSellingPriceNaira(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-stockQty">Stock Qty</Label>
              <Input
                id="edit-stockQty"
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateVehicle.isPending}>
              {updateVehicle.isPending ? 'Saving...' : 'Update Vehicle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function StockVehicleModal({ vehicle, onDone }: { vehicle: any; onDone: () => void }) {
  const queryClient = useQueryClient()
  const adjustStock = useAdjustVehicleStockMutation()

  const [qtyToAdd, setQtyToAdd] = useState('1')
  const [reorderLevel, setReorderLevel] = useState((vehicle.reorderLevel ?? 0).toString())
  const [costNaira, setCostNaira] = useState(vehicle.cost != null ? (vehicle.cost / 100).toString() : '')
  const [sellingPriceNaira, setSellingPriceNaira] = useState(
    vehicle.sellingPrice != null ? (vehicle.sellingPrice / 100).toString() : '',
  )

  async function handleStock(e: React.FormEvent) {
    e.preventDefault()
    const added = parseInt(qtyToAdd, 10) || 0
    if (added === 0) {
      toast.error('Please enter a non-zero quantity to add.')
      return
    }

    const cost = costNaira ? Math.round(parseFloat(costNaira) * 100) : undefined
    const sellingPrice = sellingPriceNaira ? Math.round(parseFloat(sellingPriceNaira) * 100) : undefined

    await adjustStock.mutateAsync(
      {
        vehicleId: vehicle._id as Id<'vehicles'>,
        qtyToAdd: added,
        cost,
        sellingPrice,
        reorderLevel: parseInt(reorderLevel, 10) || 0,
      },
      {
        onSuccess: () => {
          toast.success(`Stock updated for ${vehicle.make} ${vehicle.model}.`)
          void queryClient.invalidateQueries()
          onDone()
        },
        onError: (err: any) => toast.error(err.message),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Stock - {vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-[13px] text-mute">
          Current Stock: <strong className="text-ink">{vehicle.stockQty ?? 1} units</strong> | Reorder Threshold: <strong>{vehicle.reorderLevel ?? 0} units</strong>
        </p>
        <form onSubmit={handleStock} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="stock-qty-add">Quantity to Add *</Label>
              <Input
                id="stock-qty-add"
                type="number"
                value={qtyToAdd}
                onChange={(e) => setQtyToAdd(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock-reorder">Reorder Level</Label>
              <Input
                id="stock-reorder"
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stock-cost">Cost Price (NGN)</Label>
              <Input
                id="stock-cost"
                type="number"
                step="0.01"
                value={costNaira}
                onChange={(e) => setCostNaira(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stock-sellingPrice">Selling Price (NGN)</Label>
              <Input
                id="stock-sellingPrice"
                type="number"
                step="0.01"
                value={sellingPriceNaira}
                onChange={(e) => setSellingPriceNaira(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? 'Updating Stock...' : 'Confirm Stock Adjustment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
