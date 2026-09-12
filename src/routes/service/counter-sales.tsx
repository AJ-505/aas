import { useState } from 'react'
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
import { CustomerGate, type SelectedCustomer } from '~/components/CustomerGate'
import { IconChevronRight, IconPlus, IconSearch, IconX } from '~/components/icons'
import {
  counterSaleQueries,
  settingsQueries,
  useCreateCounterSaleMutation,
} from '~/lib/queries'
import { counterSaleSchema, PAYMENT_METHODS_COUNTER } from '~/lib/schemas'
import { formatDateTime, formatNaira } from '~/lib/format'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/counter-sales')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: CounterSalesPage,
})

interface CartLine {
  partId: string
  code: string
  description: string
  unitPrice: number
  qty: number
  stockQty: number
}

function CounterSalesPage() {
  const { data: user } = useCurrentUser()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || '')
  const [showCreate, setShowCreate] = useState(false)
  const { data: sales, isLoading } = useQuery(counterSaleQueries.list())

  if (
    user?.role &&
    user.role !== 'audit' &&
    !['csr', 'admin'].includes(user.role)
  ) {
    return <Navigate to="/" />
  }

  const canWrite = user?.role === 'csr' || user?.role === 'admin'

  const filtered = (sales ?? []).filter((s: any) => {
    if (!q.trim()) return true
    const term = q.toLowerCase().trim()
    return (
      s.proformaNumber?.toLowerCase().includes(term) ||
      s.customerName?.toLowerCase().includes(term) ||
      s.customerPhone?.toLowerCase().includes(term) ||
      s._id.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Counter Sales</h1>
          <p className="mt-1 text-[13px] text-mute">
            {sales
              ? `${sales.length} proforma${sales.length === 1 ? '' : 's'}`
              : 'Over-the-counter spare parts sales.'}
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowCreate((v) => !v)}>
            <IconPlus size={15} /> New Counter Sale
          </Button>
        )}
      </div>

      {showCreate && canWrite && (
        <CreateCounterSale
          onCancel={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false)
            void navigate({ to: '/service/counter-sale/$id', params: { id } })
          }}
        />
      )}

      <div className="relative max-w-md">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search proformas by number, customer or phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proforma No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Grand Total</TableHead>
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
                  No counter sales found{q ? ` matching "${q}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s: any) => (
                <TableRow
                  key={s._id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({ to: '/service/counter-sale/$id', params: { id: s._id } })
                  }
                >
                  <TableCell className="whitespace-nowrap font-mono text-[12px] font-bold text-ink">
                    {s.proformaNumber}
                  </TableCell>
                  <TableCell className="text-body">{s.customerName || 'Walk-in Customer'}</TableCell>
                  <TableCell className="text-body">{s.lineItems.length}</TableCell>
                  <TableCell className="font-semibold text-ink">
                    {formatNaira(s.grandTotal)}
                  </TableCell>
                  <TableCell className="text-[13px] text-mute">{formatDateTime(s.ts)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'cancelled' ? 'destructive' : 'success'}>
                      {s.status === 'cancelled' ? 'Cancelled' : 'Completed'}
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

function CreateCounterSale({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const createSale = useCreateCounterSaleMutation()
  const { data: settings } = useQuery(settingsQueries.get())
  const vatRate = settings?.vatRate ?? 7.5

  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [cart, setCart] = useState<CartLine[]>([])

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
          unitPrice: part.unitPrice,
          qty: Math.min(qty, part.stockQty),
          stockQty: part.stockQty,
        },
      ]
    })
  }

  function setQty(partId: string, qty: number) {
    setCart((prev) =>
      prev.map((l) =>
        l.partId === partId ? { ...l, qty: Math.max(1, Math.min(qty, l.stockQty)) } : l,
      ),
    )
  }

  function removeLine(partId: string) {
    setCart((prev) => prev.filter((l) => l.partId !== partId))
  }

  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const vat = Math.round((subtotal * vatRate) / 100)
  const grandTotal = subtotal + vat

  async function submit() {
    if (!selectedCustomer) {
      toast.error('Search for and select a customer first.')
      return
    }
    const parsed = counterSaleSchema.safeParse({
      paymentMethod,
      items: cart.map((l) => ({ partId: l.partId, qty: l.qty })),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please review the form.')
      return
    }
    try {
      const id = await createSale.mutateAsync({
        customerId: selectedCustomer._id as Id<'customers'>,
        paymentMethod: parsed.data.paymentMethod,
        items: parsed.data.items.map((i) => ({
          partId: i.partId as Id<'parts'>,
          qty: i.qty,
        })),
      })
      toast.success('Counter sale recorded — proforma ready to print.')
      void queryClient.invalidateQueries()
      onCreated(id as string)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to record counter sale.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Counter Sale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <CustomerGate
          selected={selectedCustomer}
          onSelect={setSelectedCustomer}
          title="Customer (required) — search first"
          hint="Search by name and phone so repeat customers are recognised. Pick an existing customer or create them inline; details are saved to the customer register."
          requiredMessage="Search for a customer before recording the sale."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="counter-payment">Payment Method</Label>
            <Select
              id="counter-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS_COUNTER.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
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
            <PartPicker
              onAdd={addToCart}
              disabledPartIds={cart.map((l) => l.partId)}
            />
          </div>

          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-mute">
              Proforma Items
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
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="w-20 text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
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
                        <TableCell className="text-right font-mono text-[12px]">
                          {formatNaira(l.unitPrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          <input
                            type="number"
                            min={1}
                            max={l.stockQty}
                            value={l.qty}
                            onChange={(e) => setQty(l.partId, Number(e.target.value))}
                            className="h-8 w-16 rounded-md border border-line bg-surface px-2 text-center text-[12px] text-ink"
                            aria-label={`Quantity for ${l.code}`}
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono text-[12px] font-semibold text-ink">
                          {formatNaira(l.unitPrice * l.qty)}
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

            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-mute">Subtotal</span>
                  <span className="font-mono">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mute">VAT ({vatRate}%)</span>
                  <span className="font-mono">{formatNaira(vat)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5 font-bold text-ink">
                  <span>Grand Total</span>
                  <span className="font-mono">{formatNaira(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={createSale.isPending || cart.length === 0 || !selectedCustomer}
          >
            {createSale.isPending ? 'Recording...' : 'Record & Print Proforma'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
