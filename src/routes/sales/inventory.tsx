import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
import { IconPlus } from '~/components/icons'
import {
  vehicleQueries,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useAdjustVehicleStockMutation,
} from '~/lib/queries'
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '~/lib/enums'
import { VEHICLE_STATUS_VARIANTS } from '~/lib/status-ui'
import { cn } from '~/lib/utils'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/inventory')({
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
  const { data: user } = useCurrentUser()
  const canEdit =
    user?.role === 'salesRep' ||
    user?.role === 'inventoryManager' ||
    user?.role === 'manager' ||
    user?.role === 'admin' ||
    user?.role === 'csr'

  const [statusFilter, setStatusFilter] = useState<VehicleStatus | undefined>()
  const { data: vehiclesData, isLoading } = useQuery(vehicleQueries.inventory())

  const [showAdd, setShowAdd] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [stockingVehicle, setStockingVehicle] = useState<any | null>(null)

  // Only vehicles for sale are shown in vehicle inventory
  const salesVehicles = (vehiclesData ?? []).filter(
    (v: any) => v.status !== 'customerOwned',
  )
  const visibleVehicles = statusFilter
    ? salesVehicles.filter((v) => v.status === statusFilter)
    : salesVehicles
  const countFor = (status?: VehicleStatus) =>
    status ? salesVehicles.filter((v) => v.status === status).length : salesVehicles.length

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

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [costNaira, setCostNaira] = useState('')
  const [sellingPriceNaira, setSellingPriceNaira] = useState('')
  const [stockQty, setStockQty] = useState('1')
  const [reorderLevel, setReorderLevel] = useState('0')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!make.trim() || !model.trim() || !color.trim() || !year) {
      toast.error('Make, model, year, and colour are required.')
      return
    }

    const cost = costNaira ? Math.round(parseFloat(costNaira) * 100) : undefined
    const sellingPrice = sellingPriceNaira ? Math.round(parseFloat(sellingPriceNaira) * 100) : undefined

    await createVehicle.mutateAsync(
      {
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        color: color.trim(),
        cost,
        sellingPrice,
        status: 'inStock',
        stockQty: parseInt(stockQty, 10) || 1,
        reorderLevel: parseInt(reorderLevel, 10) || 0,
      },
      {
        onSuccess: () => {
          toast.success('Vehicle added to inventory.')
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
        <CardTitle>Add Showroom Stock Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Camry"
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="color">Colour *</Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Silver"
                required
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost Price (NGN)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={costNaira}
                onChange={(e) => setCostNaira(e.target.value)}
                placeholder="e.g. 5000000"
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price (NGN)</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={sellingPriceNaira}
                onChange={(e) => setSellingPriceNaira(e.target.value)}
                placeholder="e.g. 6500000"
              />
            </div>
            <div>
              <Label htmlFor="stockQty">Initial Stock Qty *</Label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="reorderLevel">Reorder Level *</Label>
              <Input
                id="reorderLevel"
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
            <Button type="submit" disabled={createVehicle.isPending}>
              {createVehicle.isPending ? 'Saving...' : 'Save Stock Vehicle'}
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
              <Input id="edit-make" value={make} onChange={(e) => setMake(e.target.value)} required />
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
