import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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

import { useCurrentUser } from '~/lib/auth'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/service/finance')({
  component: FinancePage,
})

function FinancePage() {
  const { data: user } = useCurrentUser()

  if (user?.role && user.role !== 'audit' && !['finance', 'manager', 'admin'].includes(user.role)) {
    return <Navigate to="/" />
  }
  const isAudit = user?.role === 'audit'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Finance settings</h1>
        <p className="mt-1 text-[13px] text-mute">Manage labour rates and VAT configuration.{isAudit && ' Read-only.'}</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <VatConfigCard readOnly={isAudit} />
        <LabourTypesCard readOnly={isAudit} />
      </div>
    </div>
  )
}

function VatConfigCard({ readOnly }: { readOnly?: boolean }) {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery(settingsQueries.get())
  const updateVatRate = useSetVatRateMutation()

  const formik = useFormik({
    initialValues: { vatRate: String(settings?.vatRate ?? 7.5) },
    enableReinitialize: true,
    validate: zodToFormikValidate(z.object({ vatRate: z.string().trim().min(1, "VAT is required").refine((v) => !isNaN(Number(v)), { message: "Must be a number" }).refine((v) => { const n = Number(v); return n >= 0 && n <= 100; }, { message: "VAT must be 0-100" }) })),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      if (readOnly) { setSubmitting(false); return; }
      const current = Number(values.vatRate);
      updateVatRate.mutate({ vatRate: current }, {
        onSuccess: () => { toast.success('VAT rate updated.'); void queryClient.invalidateQueries(); },
        onError: (e: any) => toast.error(e?.message ?? "Failed"),
      })
      setSubmitting(false)
    },
  })

  if (isLoading) return <Loader />

  return (
    <Card>
      <CardHeader><CardTitle>VAT configuration</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="flex items-end gap-3" noValidate>
          <div className="w-32 space-y-2">
            <Label htmlFor="vatRate">VAT rate (%)</Label>
            <Input id="vatRate" name="vatRate" type="number" min={0} max={100} step={0.5} value={formik.values.vatRate} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={readOnly} aria-invalid={!!(formik.touched.vatRate && formik.errors.vatRate)} />
            <FieldError touched={formik.touched.vatRate} error={formik.errors.vatRate} />
          </div>
          {!readOnly && (
            <Button type="submit" disabled={updateVatRate.isPending || formik.isSubmitting}>
              {updateVatRate.isPending || formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </form>
        <p className="mt-3 text-[12.5px] text-mute">
          This rate is applied when generating invoices.{readOnly && ' Read-only for audit role.'}
        </p>
      </CardContent>
    </Card>
  )
}

function LabourTypesCard({ readOnly }: { readOnly?: boolean }) {
  const queryClient = useQueryClient()
  const { data: labourTypes, isLoading } = useQuery(labourTypeQueries.list())
  const create = useCreateLabourTypeMutation()
  const update = useUpdateLabourTypeMutation()
  const remove = useRemoveLabourTypeMutation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')

  const createSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    fixedPrice: z.string().trim().min(1, "Price is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, { message: "Enter a valid price." }),
  })
  const createFormik = useFormik({
    initialValues: { name: '', fixedPrice: '' },
    validate: zodToFormikValidate(createSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const price = Math.round(Number(values.fixedPrice) * 100)
      create.mutate({ name: values.name.trim(), fixedPrice: price }, {
        onSuccess: () => { toast.success('Labour type created.'); resetForm(); void queryClient.invalidateQueries() },
        onError: (e: any) => toast.error(e?.message ?? "Failed"),
      })
      setSubmitting(false)
    },
  })

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
        {/* create form - Formik */}
        {!readOnly && (
          <form onSubmit={createFormik.handleSubmit} className="flex items-end gap-3" noValidate>
            <div className="flex-1 space-y-2">
              <Label htmlFor="ltName">Name</Label>
              <Input id="ltName" name="name" placeholder="e.g. Oil Change" value={createFormik.values.name} onChange={createFormik.handleChange} onBlur={createFormik.handleBlur} aria-invalid={!!(createFormik.touched.name && createFormik.errors.name)} />
              <FieldError touched={createFormik.touched.name} error={createFormik.errors.name} />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor="ltPrice">Fixed price (&#8358;)</Label>
              <Input id="ltPrice" name="fixedPrice" type="number" min={0} placeholder="5000" value={createFormik.values.fixedPrice} onChange={createFormik.handleChange} onBlur={createFormik.handleBlur} aria-invalid={!!(createFormik.touched.fixedPrice && createFormik.errors.fixedPrice)} />
              <FieldError touched={createFormik.touched.fixedPrice} error={createFormik.errors.fixedPrice} />
            </div>
            <Button type="submit" disabled={create.isPending || createFormik.isSubmitting}>Add</Button>
          </form>
        )}

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
                          {readOnly ? (
                            <span className="text-xs text-mute">Read-only</span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingId(lt._id)
                                setEditName(lt.name)
                                setEditPrice(String(lt.fixedPrice / 100))
                              }}>Edit</Button>
                              <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemove(lt._id)}>Delete</Button>
                            </div>
                          )}
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
