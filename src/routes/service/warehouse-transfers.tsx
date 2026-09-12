import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCurrentUser } from '~/lib/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select } from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import { PartPicker } from '~/components/PartPicker'
import { IconChevronRight, IconPlus, IconSearch, IconX } from '~/components/icons'
import {
  warehouseQueries,
  warehouseTransferQueries,
  useCreateWarehouseMutation,
  useCreateWarehouseTransferMutation,
} from '~/lib/queries'
import { warehouseTransferSchema } from '~/lib/schemas'
import { formatDateTime } from '~/lib/format'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/warehouse-transfers')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: WarehouseTransfersPage,
})

interface TransferLine {
  partId: string
  code: string
  description: string
  qty: number
  stockQty: number
  unit: string
  remarks: string
}

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  dispatched: 'warning',
  received: 'success',
  cancelled: 'destructive',
}

function WarehouseTransfersPage() {
  const { data: user } = useCurrentUser()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || '')
  const [showCreate, setShowCreate] = useState(false)
  const [showAddWarehouse, setShowAddWarehouse] = useState(false)
  const { data: transfers, isLoading } = useQuery(warehouseTransferQueries.list())

  if (
    user?.role &&
    user.role !== 'audit' &&
    !['csr', 'inventoryManager', 'admin'].includes(user.role)
  ) {
    return <Navigate to="/" />
  }

  const canWrite = user?.role === 'csr' || user?.role === 'inventoryManager' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  const filtered = (transfers ?? []).filter((t: any) => {
    if (!q.trim()) return true
    const term = q.toLowerCase().trim()
    return (
      t.waybillNumber?.toLowerCase().includes(term) ||
      t.fromLabel?.toLowerCase().includes(term) ||
      t.toLabel?.toLowerCase().includes(term) ||
      t._id.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Warehouse Transfers
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {transfers
              ? `${transfers.length} waybill${transfers.length === 1 ? '' : 's'}`
              : 'Move spare parts between warehouses.'}
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowAddWarehouse((v) => !v)}>
                {showAddWarehouse ? 'Hide warehouse form' : 'Add warehouse'}
              </Button>
            )}
            <Button onClick={() => setShowCreate((v) => !v)}>
              <IconPlus size={15} /> New Transfer
            </Button>
          </div>
        )}
      </div>

      {showAddWarehouse && isAdmin && (
        <AddWarehouseCard onDone={() => setShowAddWarehouse(false)} />
      )}

      {showCreate && canWrite && (
        <CreateTransfer
          onCancel={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false)
            void navigate({ to: '/service/warehouse-transfer/$id', params: { id } })
          }}
        />
      )}

      <div className="relative max-w-md">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search waybills by number or warehouse..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waybill No.</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No transfers found{q ? ` matching "${q}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t: any) => (
                <TableRow
                  key={t._id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({ to: '/service/warehouse-transfer/$id', params: { id: t._id } })
                  }
                >
                  <TableCell className="whitespace-nowrap font-mono text-[12px] font-bold text-ink">
                    {t.waybillNumber}
                  </TableCell>
                  <TableCell className="text-body">{t.fromLabel}</TableCell>
                  <TableCell className="text-body">{t.toLabel}</TableCell>
                  <TableCell className="text-body">{t.lineItems.length}</TableCell>
                  <TableCell className="text-[13px] text-mute">{formatDateTime(t.ts)}</TableCell>
                  <TableCell>
                    <Badge dot variant={STATUS_VARIANTS[t.status] ?? 'secondary'}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
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

function AddWarehouseCard({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const createWarehouse = useCreateWarehouseMutation()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Warehouse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="wh-name">Name *</Label>
            <Input
              id="wh-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cedric Masters Autos — Port Harcourt"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wh-address">Address</Label>
            <Input
              id="wh-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, state"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button
            disabled={createWarehouse.isPending || !name.trim()}
            onClick={async () => {
              try {
                await createWarehouse.mutateAsync({ name, address: address || undefined })
                toast.success('Warehouse added.')
                void queryClient.invalidateQueries()
                onDone()
              } catch (err: any) {
                toast.error(err?.message ?? 'Failed to add warehouse.')
              }
            }}
          >
            {createWarehouse.isPending ? 'Saving...' : 'Add Warehouse'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateTransfer({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const createTransfer = useCreateWarehouseTransferMutation()
  const { data: warehouses } = useQuery(warehouseQueries.list())

  const headOffice = (warehouses ?? []).find((w: any) => w.isHeadOffice)
  const [fromId, setFromId] = useState(headOffice?._id ?? '')
  const [toId, setToId] = useState('')
  const [cart, setCart] = useState<TransferLine[]>([])

  // Default the source to the head office once warehouses load.
  useEffect(() => {
    if (!fromId && headOffice?._id) setFromId(headOffice._id)
  }, [fromId, headOffice?._id])

  function addToCart(part: any, qty: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.partId === part.partId)
      if (existing) {
        const nextQty = Math.min(existing.qty + qty, part.stockQty)
        return prev.map((l) => (l.partId === part.partId ? { ...l, qty: nextQty } : l))
      }
      return [
        ...prev,
        {
          partId: part.partId,
          code: part.code,
          description: part.description,
          qty: Math.min(qty, part.stockQty),
          stockQty: part.stockQty,
          unit: 'pcs',
          remarks: '',
        },
      ]
    })
  }

  function patchLine(partId: string, patch: Partial<TransferLine>) {
    setCart((prev) => prev.map((l) => (l.partId === partId ? { ...l, ...patch } : l)))
  }

  function removeLine(partId: string) {
    setCart((prev) => prev.filter((l) => l.partId !== partId))
  }

  async function submit() {
    const parsed = warehouseTransferSchema.safeParse({
      fromWarehouseId: fromId,
      toWarehouseId: toId,
      items: cart.map((l) => ({
        partId: l.partId,
        qty: l.qty,
        unit: l.unit,
        remarks: l.remarks,
      })),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please review the form.')
      return
    }
    if (parsed.data.fromWarehouseId === parsed.data.toWarehouseId) {
      toast.error('Source and destination warehouses must be different.')
      return
    }
    try {
      const id = await createTransfer.mutateAsync({
        fromWarehouseId: parsed.data.fromWarehouseId as Id<'warehouses'>,
        toWarehouseId: parsed.data.toWarehouseId as Id<'warehouses'>,
        items: parsed.data.items.map((i) => ({
          partId: i.partId as Id<'parts'>,
          qty: i.qty,
          unit: i.unit || undefined,
          remarks: i.remarks || undefined,
        })),
      })
      toast.success('Transfer dispatched — waybill ready to print.')
      void queryClient.invalidateQueries()
      onCreated(id as string)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create transfer.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Inter-Warehouse Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="from-warehouse">From Warehouse *</Label>
            <Select
              id="from-warehouse"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              <option value="">-- Select source --</option>
              {(warehouses ?? []).map((w: any) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-warehouse">To Warehouse *</Label>
            <Select id="to-warehouse" value={toId} onChange={(e) => setToId(e.target.value)}>
              <option value="">-- Select destination --</option>
              {(warehouses ?? [])
                .filter((w: any) => w._id !== fromId)
                .map((w: any) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-mute">
              Select Spare Parts
            </p>
            <PartPicker onAdd={addToCart} disabledPartIds={cart.map((l) => l.partId)} />
          </div>

          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-mute">
              Waybill Items
            </p>
            <div className="rounded-lg border border-line-soft">
              {cart.length === 0 ? (
                <p className="p-4 text-[13px] text-mute">
                  No parts added yet. Search and add spare parts from the left.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead className="w-20 text-center">Qty</TableHead>
                      <TableHead className="w-20">Unit</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((l) => (
                      <TableRow key={l.partId}>
                        <TableCell>
                          <span className="font-mono text-[11px] font-bold text-accent">
                            {l.code}
                          </span>
                          <p className="text-[12px] text-body">{l.description}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="number"
                            min={1}
                            max={l.stockQty}
                            value={l.qty}
                            onChange={(e) =>
                              patchLine(l.partId, {
                                qty: Math.max(1, Math.min(Number(e.target.value), l.stockQty)),
                              })
                            }
                            className="h-8 w-16 rounded-md border border-line bg-surface px-2 text-center text-[12px] text-ink"
                            aria-label={`Quantity for ${l.code}`}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            value={l.unit}
                            onChange={(e) => patchLine(l.partId, { unit: e.target.value })}
                            className="h-8 w-16 rounded-md border border-line bg-surface px-2 text-[12px] text-ink"
                            aria-label={`Unit for ${l.code}`}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            value={l.remarks}
                            onChange={(e) => patchLine(l.partId, { remarks: e.target.value })}
                            placeholder="Optional"
                            className="h-8 w-full rounded-md border border-line bg-surface px-2 text-[12px] text-ink"
                            aria-label={`Remarks for ${l.code}`}
                          />
                        </TableCell>
                        <TableCell className="px-2">
                          <button
                            type="button"
                            aria-label={`Remove ${l.code}`}
                            className="grid size-7 place-items-center rounded-md text-mute hover:bg-bg hover:text-rose-600"
                            onClick={() => removeLine(l.partId)}
                          >
                            <IconX size={14} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={createTransfer.isPending || cart.length === 0 || !toId || !fromId}
          >
            {createTransfer.isPending ? 'Dispatching...' : 'Dispatch & Print Waybill'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
