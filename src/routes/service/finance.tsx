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
import { Badge } from '~/components/ui/badge'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Settings</h1>
        <p className="text-sm text-slate-500">Manage labour rates and VAT configuration.</p>
      </div>
      <VatConfigCard />
      <LabourTypesCard />
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
      <CardHeader><CardTitle>VAT Configuration</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="vatRate">VAT Rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={current}
              onChange={(e) => setVatRate(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <Button onClick={handleSave} disabled={updateVatRate.isPending}>
            {updateVatRate.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
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
    <Card>
      <CardHeader><CardTitle>Labour Types</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="ltName">Name</Label>
            <Input id="ltName" placeholder="e.g. Oil Change" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ltPrice">Fixed Price (&#8358;)</Label>
            <Input id="ltPrice" type="number" min={0} placeholder="5000" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} className="w-32" />
          </div>
          <Button type="submit" disabled={create.isPending}>Add</Button>
        </form>

        {/* List */}
        {isLoading ? (
          <Loader />
        ) : !labourTypes || labourTypes.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No labour types configured yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Fixed Price</TableHead>
                <TableHead />
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
                        <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="h-8 w-32" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(lt._id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{lt.name}</TableCell>
                      <TableCell>{formatNaira(lt.fixedPrice)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingId(lt._id)
                            setEditName(lt.name)
                            setEditPrice(String(lt.fixedPrice / 100))
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemove(lt._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
