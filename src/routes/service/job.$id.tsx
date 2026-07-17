import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
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
  jobQueries,
  partQueries,
  labourTypeQueries,
  userQueries,
  useAssignMutation,
  useDiagnoseMutation,
  useStartWorkMutation,
  useMarkReadyMutation,
  useCompleteMutation,
  useAddJobItemMutation,
  useRemoveJobItemMutation,
  useCreatePartsRequestMutation,
  useReviewPartsRequestMutation,
  useDispatchPartsRequestMutation,
  useGenerateInvoiceMutation,
  useApproveInvoiceMutation,
  useRecordPaymentMutation,
  useMarkPaidMutation,
} from '~/lib/queries'
import {
  JOB_STATUS_LABELS,
  PARTS_REQUEST_STATUS_LABELS,
  JOB_ITEM_TYPE_LABELS,
  type JobStatus,
} from '~/lib/enums'
import { nextStatuses } from '~/lib/job-utils'
import { formatNaira, formatDateTime } from '~/lib/format'
import { useCurrentUser } from '~/lib/auth'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/job/$id')({
  component: JobDetailPage,
})

function JobDetailPage() {
  const { id: jobId } = Route.useParams()
  const { data, isLoading } = useQuery(jobQueries.detail(jobId))
  const { data: me } = useCurrentUser()

  if (isLoading) return <Loader />
  if (!data || !data.job) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Job not found.</p>
        <Link to="/service/jobs" className="text-sm underline">Back to jobs</Link>
      </div>
    )
  }

  const { job, vehicle, customer, technician, csr, jobItems, partsRequests, invoice, payments } = data

  const canActOnJob =
    me?.role === 'admin' ||
    me?.role === 'manager' ||
    (me?.role === 'technician' && (!job.technicianId || job.technicianId === me._id)) ||
    (me?.role === 'csr' && ['checkedIn', 'readyForPickup'].includes(job.status))

  const allowedNext = nextStatuses(job.status as JobStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/service/jobs" className="text-sm text-slate-500 hover:underline">
            &larr; Back to jobs
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            Job {job._id.slice(-6)}
          </h1>
          <Badge variant="secondary" className="mt-1">
            {JOB_STATUS_LABELS[job.status as JobStatus]}
          </Badge>
        </div>
      </div>

      {/* Vehicle + Customer info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Vehicle</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {vehicle ? (
              <>
                <p><span className="font-medium">{vehicle.make} {vehicle.model}</span> ({vehicle.year})</p>
                <p className="text-slate-500">Colour: {vehicle.color}</p>
                {vehicle.plate && <p className="text-slate-500">Plate: {vehicle.plate.toUpperCase()}</p>}
                {vehicle.vin && <p className="text-slate-500">VIN: {vehicle.vin}</p>}
              </>
            ) : <p className="text-slate-500">Vehicle not found.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {customer ? (
              <>
                <p className="font-medium">{customer.name}</p>
                <p className="text-slate-500">{customer.phone}</p>
                {customer.email && <p className="text-slate-500">{customer.email}</p>}
              </>
            ) : <p className="text-slate-500">Customer not found.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Complaint + Diagnosis */}
      <Card>
        <CardHeader><CardTitle>Complaint</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{job.complaint}</p>
          {job.diagnosis && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs font-medium text-slate-500">Diagnosis</p>
              <p className="mt-1 text-sm text-slate-700">{job.diagnosis}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status actions */}
      {allowedNext.length > 0 && (
        <StatusActions jobId={job._id} status={job.status as JobStatus} allowedNext={allowedNext} />
      )}

      {/* Assign technician */}
      {job.status === 'checkedIn' && (
        <AssignTechnician jobId={job._id} />
      )}

      {/* Diagnosis form */}
      {job.status === 'assigned' && canActOnJob && (
        <DiagnosisForm jobId={job._id} />
      )}

      {/* Job items (parts + labour) */}
      {['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status) && canActOnJob && (
        <AddJobItemForm jobId={job._id} />
      )}

      <JobItemsTable jobItems={jobItems} canRemove={canActOnJob && ['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status)} />

      {/* Parts requests */}
      {['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status) && canActOnJob && (
        <CreatePartsRequestForm jobId={job._id} />
      )}
      {partsRequests.length > 0 && (
        <PartsRequestsList partsRequests={partsRequests} />
      )}

      {/* Invoice */}
      {job.status !== 'checkedIn' && job.status !== 'assigned' && (
        <InvoiceSection
          jobId={job._id}
          invoice={invoice}
          payments={payments}
          hasItems={jobItems.length > 0}
        />
      )}

      {/* Mark paid */}
      {job.status === 'completed' && (me?.role === 'finance' || me?.role === 'manager' || me?.role === 'admin') && invoice?.paid && (
        <MarkPaidButton jobId={job._id} />
      )}
    </div>
  )
}

function StatusActions({ jobId, status, allowedNext }: { jobId: string; status: JobStatus; allowedNext: JobStatus[] }) {
  const queryClient = useQueryClient()
  const { data: me } = useCurrentUser()
  const startWork = useStartWorkMutation()
  const markReady = useMarkReadyMutation()
  const complete = useCompleteMutation()

  function invalidate() {
    void queryClient.invalidateQueries()
  }

  function handleTransition(target: JobStatus) {
    const opts = { onSuccess: () => { toast.success(`Job moved to ${JOB_STATUS_LABELS[target]}`); invalidate() } }
    if (target === 'inProgress') startWork.mutate({ jobId: jobId as Id<'jobs'> }, opts)
    else if (target === 'readyForPickup') markReady.mutate({ jobId: jobId as Id<'jobs'> }, opts)
    else if (target === 'completed') complete.mutate({ jobId: jobId as Id<'jobs'> }, opts)
  }

  const role = me?.role
  const canStartWork = role === 'technician' || role === 'manager' || role === 'admin'
  const canMarkReady = role === 'technician' || role === 'manager' || role === 'admin'
  const canComplete = role === 'csr' || role === 'manager' || role === 'admin'

  return (
    <Card>
      <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {allowedNext.includes('inProgress') && canStartWork && (
          <Button onClick={() => handleTransition('inProgress')} disabled={startWork.isPending}>
            {startWork.isPending ? 'Starting...' : 'Start Work'}
          </Button>
        )}
        {allowedNext.includes('readyForPickup') && canMarkReady && (
          <Button onClick={() => handleTransition('readyForPickup')} disabled={markReady.isPending}>
            {markReady.isPending ? 'Updating...' : 'Mark Ready for Pickup'}
          </Button>
        )}
        {allowedNext.includes('completed') && canComplete && (
          <Button onClick={() => handleTransition('completed')} disabled={complete.isPending}>
            {complete.isPending ? 'Completing...' : 'Mark Completed'}
          </Button>
        )}
        {allowedNext.length === 0 && (
          <p className="text-sm text-slate-500">No further actions available.</p>
        )}
      </CardContent>
    </Card>
  )
}

function AssignTechnician({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const { data: techs } = useQuery(userQueries.listTechnicians())
  const assign = useAssignMutation()
  const [techId, setTechId] = useState('')

  function handleAssign() {
    if (!techId) { toast.error('Select a technician.'); return }
    assign.mutate({ jobId: jobId as Id<'jobs'>, technicianId: techId as Id<'users'> }, {
      onSuccess: () => { toast.success('Technician assigned.'); void queryClient.invalidateQueries() },
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Assign Technician</CardTitle></CardHeader>
      <CardContent className="flex gap-3">
        <select
          className="h-9 rounded-md border border-slate-300 px-3 text-sm"
          value={techId}
          onChange={(e) => setTechId(e.target.value)}
        >
          <option value="" disabled>Select technician...</option>
          {techs?.map((t: any) => (
            <option key={t._id} value={t._id}>{t.name ?? 'Unnamed'}</option>
          ))}
        </select>
        <Button onClick={handleAssign} disabled={assign.isPending}>
          {assign.isPending ? 'Assigning...' : 'Assign'}
        </Button>
      </CardContent>
    </Card>
  )
}

function DiagnosisForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const diagnose = useDiagnoseMutation()
  const [diagnosis, setDiagnosis] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!diagnosis.trim()) { toast.error('Diagnosis cannot be empty.'); return }
    diagnose.mutate({ jobId: jobId as Id<'jobs'>, diagnosis: diagnosis.trim() }, {
      onSuccess: () => { toast.success('Diagnosis saved.'); setDiagnosis(''); void queryClient.invalidateQueries() },
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Record Diagnosis</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="diagnosis">What did you find during inspection?</Label>
          <textarea
            id="diagnosis"
            className="flex min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Describe the issue identified..."
          />
          <Button type="submit" disabled={diagnose.isPending}>
            {diagnose.isPending ? 'Saving...' : 'Save Diagnosis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AddJobItemForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const { data: parts } = useQuery(partQueries.list())
  const { data: labourTypes } = useQuery(labourTypeQueries.list())
  const addJobItem = useAddJobItemMutation()
  const [itemType, setItemType] = useState<'part' | 'labour'>('part')
  const [partId, setPartId] = useState('')
  const [labourTypeId, setLabourTypeId] = useState('')
  const [qty, setQty] = useState(1)

  const selectedPart = parts?.find((p: any) => p._id === partId)
  const selectedLabour = labourTypes?.find((lt: any) => lt._id === labourTypeId)
  const unitPrice = itemType === 'part' ? (selectedPart?.sellingPrice ?? 0) : (selectedLabour?.fixedPrice ?? 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (itemType === 'part') {
      if (!partId) { toast.error('Select a part.'); return }
      addJobItem.mutate({ jobId: jobId as Id<'jobs'>, type: 'part', partId: partId as Id<'parts'>, qty, unitPrice }, {
        onSuccess: () => { toast.success('Part added.'); setPartId(''); setQty(1); void queryClient.invalidateQueries() },
      })
    } else {
      if (!labourTypeId) { toast.error('Select a labour type.'); return }
      addJobItem.mutate({ jobId: jobId as Id<'jobs'>, type: 'labour', labourTypeId: labourTypeId as Id<'labourTypes'>, qty, unitPrice }, {
        onSuccess: () => { toast.success('Labour added.'); setLabourTypeId(''); setQty(1); void queryClient.invalidateQueries() },
      })
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add Parts / Labour</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={itemType === 'part' ? 'default' : 'outline'} onClick={() => setItemType('part')}>Part</Button>
            <Button type="button" size="sm" variant={itemType === 'labour' ? 'default' : 'outline'} onClick={() => setItemType('labour')}>Labour</Button>
          </div>
          {itemType === 'part' ? (
            <div className="space-y-2">
              <Label htmlFor="part">Part</Label>
              <select id="part" className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="" disabled>Select part...</option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.code} - {p.description} ({formatNaira(p.sellingPrice)})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="labour">Labour Type</Label>
              <select id="labour" className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm" value={labourTypeId} onChange={(e) => setLabourTypeId(e.target.value)}>
                <option value="" disabled>Select labour type...</option>
                {labourTypes?.map((lt: any) => (
                  <option key={lt._id} value={lt._id}>{lt.name} ({formatNaira(lt.fixedPrice)})</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">Qty</Label>
              <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24" />
            </div>
            <div className="text-sm text-slate-500">
              Unit price: <span className="font-medium text-slate-900">{formatNaira(unitPrice)}</span>
            </div>
          </div>
          <Button type="submit" disabled={addJobItem.isPending}>
            {addJobItem.isPending ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function JobItemsTable({ jobItems, canRemove }: { jobItems: any[]; canRemove: boolean }) {
  const queryClient = useQueryClient()
  const removeItem = useRemoveJobItemMutation()

  if (jobItems.length === 0) return null

  return (
    <Card>
      <CardHeader><CardTitle>Job Items</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Line Total</TableHead>
              {canRemove && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobItems.map((item: any) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Badge variant="secondary">{JOB_ITEM_TYPE_LABELS[item.type as keyof typeof JOB_ITEM_TYPE_LABELS]}</Badge>
                </TableCell>
                <TableCell className="text-slate-600">
                  {item.type === 'part' && item.partId ? 'Part' : item.type === 'labour' && item.labourTypeId ? 'Labour' : '—'}
                </TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>{formatNaira(item.unitPrice)}</TableCell>
                <TableCell className="font-medium">{formatNaira(item.lineTotal)}</TableCell>
                {canRemove && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => removeItem.mutate({ jobItemId: item._id }, {
                        onSuccess: () => { toast.success('Item removed.'); void queryClient.invalidateQueries() },
                      })}
                    >
                      Remove
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CreatePartsRequestForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const { data: parts } = useQuery(partQueries.list())
  const createRequest = useCreatePartsRequestMutation()
  const [items, setItems] = useState<{ partId: string; qty: number }[]>([])
  const [partId, setPartId] = useState('')
  const [qty, setQty] = useState(1)

  function addItem() {
    if (!partId) { toast.error('Select a part.'); return }
    setItems([...items, { partId, qty }])
    setPartId('')
    setQty(1)
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Add at least one part.'); return }
    createRequest.mutate({ 
      jobId: jobId as Id<'jobs'>, 
      items: items.map(item => ({ partId: item.partId as Id<'parts'>, qty: item.qty }))
    }, {
      onSuccess: () => { toast.success('Parts request submitted.'); setItems([]); void queryClient.invalidateQueries() },
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Request Parts from Inventory</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const part = parts?.find((p: any) => p._id === item.partId)
                return (
                  <div key={idx} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span>{part?.code ?? 'Unknown'} - {part?.description ?? ''} x{item.qty}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>Remove</Button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="reqPart">Part</Label>
              <select id="reqPart" className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="" disabled>Select part...</option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.code} - {p.description} (Stock: {p.stockQty})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reqQty">Qty</Label>
              <Input id="reqQty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24" />
            </div>
            <Button type="button" variant="outline" onClick={addItem}>Add to request</Button>
          </div>
          <Button type="submit" disabled={createRequest.isPending}>
            {createRequest.isPending ? 'Submitting...' : 'Submit Parts Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PartsRequestsList({ partsRequests }: { partsRequests: any[] }) {
  const queryClient = useQueryClient()
  const { data: me } = useCurrentUser()
  const review = useReviewPartsRequestMutation()
  const dispatch = useDispatchPartsRequestMutation()

  const canReview = me?.role === 'inventoryManager' || me?.role === 'manager' || me?.role === 'admin'

  return (
    <Card>
      <CardHeader><CardTitle>Parts Requests</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {partsRequests.map((pr: any) => (
            <div key={pr._id} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <Badge variant={
                  pr.status === 'dispatched' ? 'success' :
                  pr.status === 'approved' ? 'secondary' :
                  pr.status === 'rejected' ? 'destructive' : 'warning'
                }>
                  {PARTS_REQUEST_STATUS_LABELS[pr.status as keyof typeof PARTS_REQUEST_STATUS_LABELS]}
                </Badge>
                {canReview && pr.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() =>
                      review.mutate({ partsRequestId: pr._id, status: 'rejected' }, {
                        onSuccess: () => { toast.success('Request rejected.'); void queryClient.invalidateQueries() },
                      })
                    }>Reject</Button>
                    <Button size="sm" onClick={() =>
                      review.mutate({ partsRequestId: pr._id, status: 'approved' }, {
                        onSuccess: () => { toast.success('Request approved.'); void queryClient.invalidateQueries() },
                      })
                    }>Approve</Button>
                  </div>
                )}
                {canReview && pr.status === 'approved' && (
                  <Button size="sm" onClick={() =>
                    dispatch.mutate({ partsRequestId: pr._id }, {
                      onSuccess: () => { toast.success('Parts dispatched.'); void queryClient.invalidateQueries() },
                    })
                  } disabled={dispatch.isPending}>
                    {dispatch.isPending ? 'Dispatching...' : 'Dispatch'}
                  </Button>
                )}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {pr.items.map((item: any, idx: number) => (
                  <span key={idx} className="mr-3">{item.qty}x part</span>
                ))}
              </div>
              {pr.note && <p className="mt-1 text-xs text-slate-500">Note: {pr.note}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceSection({ jobId, invoice, payments, hasItems }: {
  jobId: string
  invoice: any
  payments: any[]
  hasItems: boolean
}) {
  const queryClient = useQueryClient()
  const { data: me } = useCurrentUser()
  const generate = useGenerateInvoiceMutation()
  const approve = useApproveInvoiceMutation()
  const recordPayment = useRecordPaymentMutation()
  const [method, setMethod] = useState('cash')

  const canFinance = me?.role === 'finance' || me?.role === 'manager' || me?.role === 'admin'

  if (!invoice) {
    if (!canFinance) {
      return (
        <Card>
          <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-500">Invoice has not been generated yet.</p></CardContent>
        </Card>
      )
    }
    return (
      <Card>
        <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
        <CardContent>
          {!hasItems ? (
            <p className="text-sm text-slate-500">Add parts or labour before generating an invoice.</p>
          ) : (
            <Button onClick={() => generate.mutate({ jobId: jobId as Id<'jobs'> }, {
              onSuccess: () => { toast.success('Invoice generated.'); void queryClient.invalidateQueries() },
            })} disabled={generate.isPending}>
              {generate.isPending ? 'Generating...' : 'Generate Invoice'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const balance = invoice.grandTotal - invoice.amountPaid

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invoice</CardTitle>
          <Badge variant={invoice.approved ? 'success' : 'warning'}>
            {invoice.approved ? 'Approved' : 'Pending Approval'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((li: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="text-slate-600">{li.description}</TableCell>
                <TableCell>{li.qty}</TableCell>
                <TableCell>{formatNaira(li.unitPrice)}</TableCell>
                <TableCell className="font-medium">{formatNaira(li.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Parts Total</span><span>{formatNaira(invoice.partsTotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Labour Total</span><span>{formatNaira(invoice.labourTotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatNaira(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">VAT</span><span>{formatNaira(invoice.vat)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold"><span>Grand Total</span><span>{formatNaira(invoice.grandTotal)}</span></div>
          <div className="flex justify-between text-emerald-700"><span>Paid</span><span>{formatNaira(invoice.amountPaid)}</span></div>
          <div className="flex justify-between font-medium"><span>Balance</span><span>{formatNaira(balance)}</span></div>
        </div>

        {/* Approve */}
        {canFinance && !invoice.approved && (
          <Button onClick={() => approve.mutate({ invoiceId: invoice._id }, {
            onSuccess: () => { toast.success('Invoice approved.'); void queryClient.invalidateQueries() },
          })} disabled={approve.isPending}>
            {approve.isPending ? 'Approving...' : 'Approve Invoice'}
          </Button>
        )}

        {/* Record payment */}
        {canFinance && invoice.approved && balance > 0 && (
          <div className="flex items-end gap-3 border-t border-slate-200 pt-4">
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <select id="method" className="h-9 rounded-md border border-slate-300 px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
            <Button onClick={() => {
              const amount = balance
              recordPayment.mutate({ invoiceId: invoice._id, amount, method }, {
                onSuccess: () => { toast.success('Payment recorded.'); void queryClient.invalidateQueries() },
              })
            }} disabled={recordPayment.isPending}>
              {recordPayment.isPending ? 'Recording...' : `Record Full Payment (${formatNaira(balance)})`}
            </Button>
          </div>
        )}

        {/* Payments history */}
        {payments.length > 0 && (
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Payment History</p>
            <div className="space-y-1">
              {payments.map((pmt: any) => (
                <div key={pmt._id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{formatDateTime(pmt.ts)} - {pmt.method}</span>
                  <span className="font-medium">{formatNaira(pmt.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MarkPaidButton({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const markPaid = useMarkPaidMutation()

  return (
    <Card>
      <CardContent className="pt-5">
        <Button onClick={() => markPaid.mutate({ jobId: jobId as Id<'jobs'> }, {
          onSuccess: () => { toast.success('Job marked as paid.'); void queryClient.invalidateQueries() },
        })} disabled={markPaid.isPending}>
          {markPaid.isPending ? 'Updating...' : 'Mark Job as Paid'}
        </Button>
      </CardContent>
    </Card>
  )
}
