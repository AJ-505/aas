import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
import { Loader } from '~/components/Loader'
import {
  labourTypeQueries,
  settingsQueries,
  useCreateLabourTypeMutation,
  useUpdateLabourTypeMutation,
  useRemoveLabourTypeMutation,
  useSetVatRateMutation,
} from '~/lib/queries'
import { formatNaira } from '~/lib/format'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/finance')({
  component: FinancePage,
})

function FinancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Finance settings</h1>
        <p className="mt-1 text-[13px] text-mute">Manage labour rates and VAT configuration.</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <VatConfigCard />
        <LabourTypesCard />
      </div>
    </div>
  )
}

function VatConfigCard() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery(settingsQueries.get())
  const updateVatRate = useSetVatRateMutation()
  const [vatRate, setVatRate] = useState<number | null>(null)

  if (isLoading) return <Loader />

  const current = vatRate ?? settings?.vatRate ?? 7.5

  function handleSave() {
    if (current < 0 || current > 100) { toast.error('VAT rate must be between 0 and 100.'); return }
    updateVatRate.mutate({ vatRate: current }, {
      onSuccess: () => { toast.success('VAT rate updated.'); setVatRate(null); void queryClient.invalidateQueries() },
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>VAT configuration</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="w-32 space-y-2">
            <Label htmlFor="vatRate">VAT rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={current}
              onChange={(e) => setVatRate(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSave} disabled={updateVatRate.isPending}>
            {updateVatRate.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className="mt-3 text-[12.5px] text-mute">
          This rate is applied when generating invoices.
        </p>
      </CardContent>
    </Card>
  )
}

function LabourTypesCard() {
  const queryClient = useQueryClient()
  const { data: labourTypes, isLoading } = useQuery(labourTypeQueries.list())
  const create = useCreateLabourTypeMutation()
  const update = useUpdateLabourTypeMutation()
  const remove = useRemoveLabourTypeMutation()
  const [name, setName] = useState('')
  const [fixedPrice, setFixedPrice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const price = Math.round(Number(fixedPrice) * 100)
    if (!name.trim()) { toast.error('Name is required.'); return }
    if (!price || price < 0) { toast.error('Enter a valid price.'); return }
    create.mutate({ name: name.trim(), fixedPrice: price }, {
      onSuccess: () => { toast.success('Labour type created.'); setName(''); setFixedPrice(''); void queryClient.invalidateQueries() },
    })
  }

  function handleUpdate(id: string) {
    const price = Math.round(Number(editPrice) * 100)
    if (!editName.trim()) { toast.error('Name is required.'); return }
    if (!price || price < 0) { toast.error('Enter a valid price.'); return }
    update.mutate({ labourTypeId: id as Id<'labourTypes'>, name: editName.trim(), fixedPrice: price }, {
      onSuccess: () => { toast.success('Labour type updated.'); setEditingId(null); void queryClient.invalidateQueries() },
    })
  }

  function handleRemove(id: string) {
    if (!confirm('Delete this labour type?')) return
    remove.mutate({ labourTypeId: id as Id<'labourTypes'> }, {
      onSuccess: () => { toast.success('Labour type deleted.'); void queryClient.invalidateQueries() },
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Labour types</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* create form */}
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="ltName">Name</Label>
            <Input id="ltName" placeholder="e.g. Oil Change" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="w-32 space-y-2">
            <Label htmlFor="ltPrice">Fixed price (&#8358;)</Label>
            <Input id="ltPrice" type="number" min={0} placeholder="5000" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} />
          </div>
          <Button type="submit" disabled={create.isPending}>Add</Button>
        </form>

        {/* list */}
        {isLoading ? (
          <Loader />
        ) : !labourTypes || labourTypes.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-mute">No labour types configured yet.</p>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-line-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Fixed price</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {labourTypes.map((lt: any) => (
                  <TableRow key={lt._id}>
                    {editingId === lt._id ? (
                      <>
                        <TableCell>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="ml-auto h-8 w-32" />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleUpdate(lt._id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-semibold text-ink">{lt.name}</TableCell>
                        <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">{formatNaira(lt.fixedPrice)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingId(lt._id)
                              setEditName(lt.name)
                              setEditPrice(String(lt.fixedPrice / 100))
                            }}>Edit</Button>
                            <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemove(lt._id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
