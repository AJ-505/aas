import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCurrentUser } from '~/lib/auth'
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
import { IconPlus, IconSearch, IconUpload } from '~/components/icons'
import {
  partQueries,
  useCreatePartMutation,
  useUpdatePartMutation,
  useAdjustStockMutation,
  useImportPartsMutation,
} from '~/lib/queries'
import { cn } from '~/lib/utils'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/parts')({
  component: PartsPage,
})

interface PartForm {
  code: string
  description: string
  costPrice: string
  sellingPrice: string
  stockQty: string
  reorderLevel: string
}

const emptyForm: PartForm = {
  code: '',
  description: '',
  costPrice: '',
  sellingPrice: '',
  stockQty: '0',
  reorderLevel: '0',
}

function PartsPage() {
  const { data: user } = useCurrentUser()
  const canEdit = user?.role === 'inventoryManager' || user?.role === 'manager' || user?.role === 'admin'

  const [q, setQ] = useState('')
  const { data: parts, isLoading } = useQuery(partQueries.search(q))

  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Parts Catalogue</h1>
          <p className="mt-1 text-[13px] text-mute">
            {parts ? `${parts.length} parts` : 'Spare parts inventory management.'}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button onClick={() => setShowImport(true)} variant="outline">
              <IconUpload size={15} /> Import CSV
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <IconPlus size={15} /> Add part
            </Button>
          </div>
        )}
      </div>

      <div className="relative max-w-sm">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search by code or description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {showAdd && <PartForm onDone={() => setShowAdd(false)} />}
      {editId && <PartForm partId={editId} onDone={() => setEditId(null)} />}
      {showImport && <CsvImport onDone={() => setShowImport(false)} />}
      {adjustId && <StockAdjustForm partId={adjustId} onDone={() => setAdjustId(null)} />}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              {canEdit && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !parts || parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="py-10 text-center text-mute">
                  {q ? 'No parts match your search.' : 'No parts in the catalogue yet.'}
                </TableCell>
              </TableRow>
            ) : (
              parts.map((p) => {
                const lowStock = p.stockQty <= p.reorderLevel
                return (
                  <TableRow key={p._id}>
                    <TableCell className="whitespace-nowrap font-semibold text-ink">
                      {p.code}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-body">{p.description}</TableCell>
                    <TableCell className="text-right text-body">
                      &#8358;{(p.costPrice / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-body">
                      &#8358;{(p.sellingPrice / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          lowStock ? 'text-rose-600' : 'text-ink',
                        )}
                      >
                        {p.stockQty}
                      </span>
                      {lowStock && (
                        <span className="ml-1.5 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          LOW
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-mute">{p.reorderLevel}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditId(p._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAdjustId(p._id)}
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

function PartForm({ partId, onDone }: { partId?: string; onDone: () => void }) {
  const queryClient = useQueryClient()
  const createPart = useCreatePartMutation()
  const updatePart = useUpdatePartMutation()
  const { data: existing } = useQuery({
    ...partQueries.list(),
    enabled: !!partId,
    select: (all) => all.find((p) => p._id === partId),
  })

  const [form, setForm] = useState<PartForm>(() => {
    if (existing) {
      return {
        code: existing.code,
        description: existing.description,
        costPrice: String(existing.costPrice),
        sellingPrice: String(existing.sellingPrice),
        stockQty: String(existing.stockQty),
        reorderLevel: String(existing.reorderLevel),
      }
    }
    return emptyForm
  })

  const handleChange = (field: keyof PartForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.description.trim()) {
      toast.error('Code and description are required.')
      return
    }
    const data = {
      code: form.code.trim(),
      description: form.description.trim(),
      costPrice: Math.round(Number(form.costPrice) * 100) || 0,
      sellingPrice: Math.round(Number(form.sellingPrice) * 100) || 0,
      stockQty: Math.max(0, Math.round(Number(form.stockQty) || 0)),
      reorderLevel: Math.max(0, Math.round(Number(form.reorderLevel) || 0)),
    }

    try {
      if (partId) {
        await updatePart.mutateAsync({ partId: partId as Id<'parts'>, ...data })
        toast.success('Part updated.')
      } else {
        await createPart.mutateAsync(data)
        toast.success('Part created.')
      }
      void queryClient.invalidateQueries()
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save part.')
    }
  }

  const saving = createPart.isPending || updatePart.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{partId ? 'Edit part' : 'Add part'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input id="code" value={form.code} onChange={handleChange('code')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input id="description" value={form.description} onChange={handleChange('description')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (Naira)</Label>
            <Input id="costPrice" type="number" min={0} value={form.costPrice} onChange={handleChange('costPrice')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price (Naira)</Label>
            <Input id="sellingPrice" type="number" min={0} value={form.sellingPrice} onChange={handleChange('sellingPrice')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQty">Stock Qty</Label>
            <Input id="stockQty" type="number" min={0} value={form.stockQty} onChange={handleChange('stockQty')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorderLevel">Reorder Level</Label>
            <Input id="reorderLevel" type="number" min={0} value={form.reorderLevel} onChange={handleChange('reorderLevel')} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : partId ? 'Update part' : 'Add part'}
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

function StockAdjustForm({ partId, onDone }: { partId: string; onDone: () => void }) {
  const queryClient = useQueryClient()
  const adjust = useAdjustStockMutation()
  const { data: part } = useQuery(partQueries.search(''))
  const p = part?.find((x) => x._id === partId)

  const [type, setType] = useState<'in' | 'out' | 'adjust'>('in')
  const [qty, setQty] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = Number(qty)
    if (!q || q <= 0) {
      toast.error('Enter a valid quantity.')
      return
    }
    try {
      await adjust.mutateAsync({
        partId: partId as Id<'parts'>,
        qty: type === 'out' ? q : type === 'adjust' ? q : q,
        type,
      })
      toast.success('Stock adjusted.')
      void queryClient.invalidateQueries()
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to adjust stock.')
    }
  }

  if (!p) return <Loader />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Stock: {p.code}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-[13px] text-mute">
          Current stock: <span className="font-semibold text-ink">{p.stockQty}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(['in', 'out', 'adjust'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
                  type === t
                    ? 'bg-accent text-white'
                    : 'bg-line-soft text-body hover:bg-line'
                }`}
              >
                {t === 'in' ? 'Stock In' : t === 'out' ? 'Stock Out' : 'Set Exact'}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjQty">
              {type === 'adjust' ? 'New stock qty' : 'Quantity to ' + (type === 'in' ? 'add' : 'remove')}
            </Label>
            <Input
              id="adjQty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={adjust.isPending}>
              {adjust.isPending ? 'Adjusting...' : 'Confirm'}
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

function CsvImport({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const importParts = useImportPartsMutation()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      toast.error('CSV must have a header row and at least one data row.')
      return
    }

    const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
    const codeIdx = headers.indexOf('code')
    const descIdx = headers.indexOf('description')
    const costIdx = headers.findIndex((h) => h.includes('cost'))
    const sellIdx = headers.findIndex((h) => h.includes('selling') || h.includes('price'))
    const stockIdx = headers.indexOf('stock')
    const reorderIdx = headers.indexOf('reorder')

    if (codeIdx === -1 || descIdx === -1) {
      toast.error('CSV must have at least "code" and "description" columns.')
      return
    }

    const parts: Array<{
      code: string
      description: string
      costPrice: number
      sellingPrice: number
      stockQty: number
      reorderLevel: number
    }> = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(',').map((c) => c.trim())
      const code = cols[codeIdx]
      const description = cols[descIdx]
      if (!code || !description) continue

      parts.push({
        code,
        description,
        costPrice: Math.round(Number(cols[costIdx] ?? 0) * 100),
        sellingPrice: Math.round(Number(cols[sellIdx] ?? 0) * 100),
        stockQty: Math.max(0, Math.round(Number(cols[stockIdx] ?? 0))),
        reorderLevel: Math.max(0, Math.round(Number(cols[reorderIdx] ?? 0))),
      })
    }

    if (parts.length === 0) {
      toast.error('No valid parts found in CSV.')
      return
    }

    try {
      const result = await importParts.mutateAsync({ parts })
      toast.success(`Imported ${result.count} parts.`)
      void queryClient.invalidateQueries()
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Import parts from CSV</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[13px] text-mute">
          CSV must have headers: <strong>code, description, cost, selling, stock, reorder</strong>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-white"
          disabled={importParts.isPending}
        />
        {importParts.isPending && <p className="text-[13px] text-mute">Importing...</p>}
        <Button variant="outline" onClick={onDone}>
          Close
        </Button>
      </CardContent>
    </Card>
  )
}
