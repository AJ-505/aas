import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import { IconCar, IconCheck, IconChevronRight, IconUsers } from '~/components/icons'
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
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  PARTS_REQUEST_STATUS_LABELS,
  JOB_ITEM_TYPE_LABELS,
  type JobStatus,
  type PartsRequestStatus,
} from '~/lib/enums'
import { JOB_STATUS_VARIANTS, PARTS_REQUEST_VARIANTS } from '~/lib/status-ui'
import { nextStatuses } from '~/lib/job-utils'
import { formatNaira, formatDateTime } from '~/lib/format'
import { useCurrentUser } from '~/lib/auth'
import { cn } from '~/lib/utils'
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
        <p className="text-mute">Job not found.</p>
        <Link to="/service/jobs" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to jobs
        </Link>
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
    <div className="space-y-5">
      {/* header */}
      <div>
        <Link
          to="/service/jobs"
          className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
        >
          <IconChevronRight size={13} className="rotate-180" /> Back to jobs
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Job #{job._id.slice(-6)}
          </h1>
          <Badge dot variant={JOB_STATUS_VARIANTS[job.status as JobStatus] ?? 'secondary'}>
            {JOB_STATUS_LABELS[job.status as JobStatus]}
          </Badge>
        </div>
        <p className="mt-1 text-[13px] text-mute">
          Checked in {formatDateTime(job.checkInTs)}
          {technician ? ` · Technician: ${technician.name}` : ''}
          {csr ? ` · Front desk: ${csr.name}` : ''}
        </p>
      </div>

      {/* status stepper */}
      <Card className="overflow-x-auto px-[18px] py-4">
        <StatusStepper status={job.status as JobStatus} />
      </Card>

      {/* vehicle + customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <span className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent">
              <IconCar size={14} />
            </span>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[13px]">
            {vehicle ? (
              <>
                <p className="font-semibold text-ink">
                  {vehicle.make} {vehicle.model} <span className="font-normal text-mute">({vehicle.year})</span>
                </p>
                <p className="text-mute">Colour: <span className="text-body">{vehicle.color}</span></p>
                {vehicle.plate && <p className="text-mute">Plate: <span className="font-medium uppercase tracking-wide text-body">{vehicle.plate}</span></p>}
                {vehicle.vin && <p className="text-mute">VIN: <span className="text-body">{vehicle.vin}</span></p>}
              </>
            ) : <p className="text-mute">Vehicle not found.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <span className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent">
              <IconUsers size={14} />
            </span>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[13px]">
            {customer ? (
              <div className="flex items-center gap-3">
                <Avatar name={customer.name} size={36} />
                <div>
                  <p className="font-semibold text-ink">{customer.name}</p>
                  <p className="text-mute">{customer.phone}</p>
                  {customer.email && <p className="text-mute">{customer.email}</p>}
                </div>
              </div>
            ) : <p className="text-mute">Customer not found.</p>}
          </CardContent>
        </Card>
      </div>

      {/* complaint + diagnosis */}
      <Card>
        <CardHeader><CardTitle>Complaint</CardTitle></CardHeader>
        <CardContent>
          <p className="text-[13px] leading-relaxed text-body">{job.complaint}</p>
          {job.diagnosis && (
            <div className="mt-4 border-t border-line-soft pt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-mute">Diagnosis</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-body">{job.diagnosis}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* status actions */}
      {allowedNext.length > 0 && (
        <StatusActions jobId={job._id} allowedNext={allowedNext} />
      )}

      {/* assign technician */}
      {job.status === 'checkedIn' && (
        <AssignTechnician jobId={job._id} />
      )}

      {/* diagnosis form */}
      {job.status === 'assigned' && canActOnJob && (
        <DiagnosisForm jobId={job._id} />
      )}

      {/* job items (parts + labour) */}
      {['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status) && canActOnJob && (
        <AddJobItemForm jobId={job._id} />
      )}

      <JobItemsTable jobItems={jobItems} canRemove={canActOnJob && ['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status)} />

      {/* parts requests */}
      {['diagnosed', 'waitingRelease', 'inProgress'].includes(job.status) && canActOnJob && (
        <CreatePartsRequestForm jobId={job._id} />
      )}
      {partsRequests.length > 0 && (
        <PartsRequestsList partsRequests={partsRequests} />
      )}

      {/* invoice */}
      {job.status !== 'checkedIn' && job.status !== 'assigned' && (
        <InvoiceSection
          jobId={job._id}
          invoice={invoice}
          payments={payments}
          hasItems={jobItems.length > 0}
        />
      )}

      {/* mark paid */}
      {job.status === 'completed' && (me?.role === 'finance' || me?.role === 'manager' || me?.role === 'admin') && invoice?.paid && (
        <MarkPaidButton jobId={job._id} />
      )}
    </div>
  )
}

function StatusStepper({ status }: { status: JobStatus }) {
  const current = JOB_STATUSES.indexOf(status)
  return (
    <div className="flex min-w-max items-center">
      {JOB_STATUSES.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full border-2 transition-colors',
                  done && 'border-accent bg-accent text-white',
                  active && 'border-accent bg-accent-soft text-accent',
                  !done && !active && 'border-line bg-white text-mute',
                )}
              >
                {done ? <IconCheck size={12} /> : <span className={cn('size-1.5 rounded-full', active ? 'bg-accent' : 'bg-line')} />}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide',
                  active ? 'text-accent-deep' : done ? 'text-body' : 'text-mute',
                )}
              >
                {JOB_STATUS_LABELS[s]}
              </span>
            </div>
            {i < JOB_STATUSES.length - 1 && (
              <span className={cn('mx-2 mb-5 h-0.5 w-8 rounded-full sm:w-10', i < current ? 'bg-accent' : 'bg-line-soft')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatusActions({ jobId, allowedNext }: { jobId: string; allowedNext: JobStatus[] }) {
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
      <CardHeader><CardTitle>Assign technician</CardTitle></CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="w-64 space-y-2">
          <Label htmlFor="tech">Technician</Label>
          <Select id="tech" value={techId} onChange={(e) => setTechId(e.target.value)}>
            <option value="" disabled>Select technician...</option>
            {techs?.map((t: any) => (
              <option key={t._id} value={t._id}>{t.name ?? 'Unnamed'}</option>
            ))}
          </Select>
        </div>
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
      <CardHeader><CardTitle>Record diagnosis</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="diagnosis">What did you find during inspection?</Label>
          <Textarea
            id="diagnosis"
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
      <CardHeader><CardTitle>Add parts / labour</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex w-fit rounded-[9px] bg-[#f2f3f7] p-0.5">
            {(['part', 'labour'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setItemType(t)}
                className={cn(
                  'rounded-[7px] px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors',
                  itemType === t ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-body',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {itemType === 'part' ? (
            <div className="space-y-2">
              <Label htmlFor="part">Part</Label>
              <Select id="part" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="" disabled>Select part...</option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.code} - {p.description} ({formatNaira(p.sellingPrice)})</option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="labour">Labour type</Label>
              <Select id="labour" value={labourTypeId} onChange={(e) => setLabourTypeId(e.target.value)}>
                <option value="" disabled>Select labour type...</option>
                {labourTypes?.map((lt: any) => (
                  <option key={lt._id} value={lt._id}>{lt.name} ({formatNaira(lt.fixedPrice)})</option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="w-24 space-y-2">
              <Label htmlFor="qty">Qty</Label>
              <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
            <div className="pb-2 text-[13px] text-mute">
              Unit price: <span className="font-bold text-ink">{formatNaira(unitPrice)}</span>
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
    <Card className="overflow-hidden">
      <CardHeader><CardTitle>Job items</CardTitle></CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Line total</TableHead>
            {canRemove && <TableHead className="w-20" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobItems.map((item: any) => (
            <TableRow key={item._id}>
              <TableCell>
                <Badge variant={item.type === 'part' ? 'info' : 'violet'}>
                  {JOB_ITEM_TYPE_LABELS[item.type as keyof typeof JOB_ITEM_TYPE_LABELS]}
                </Badge>
              </TableCell>
              <TableCell className="text-body">
                {item.type === 'part' && item.partId ? 'Part' : item.type === 'labour' && item.labourTypeId ? 'Labour' : '—'}
              </TableCell>
              <TableCell className="[font-variant-numeric:tabular-nums]">{item.qty}</TableCell>
              <TableCell className="text-right [font-variant-numeric:tabular-nums]">{formatNaira(item.unitPrice)}</TableCell>
              <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">{formatNaira(item.lineTotal)}</TableCell>
              {canRemove && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
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
      <CardHeader><CardTitle>Request parts from inventory</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((item, idx) => {
                const part = parts?.find((p: any) => p._id === item.partId)
                return (
                  <div key={idx} className="flex items-center justify-between rounded-[9px] bg-[#f6f7f9] px-3 py-2 text-[13px]">
                    <span className="text-body">{part?.code ?? 'Unknown'} - {part?.description ?? ''} ×{item.qty}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => removeItem(idx)}>Remove</Button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="reqPart">Part</Label>
              <Select id="reqPart" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="" disabled>Select part...</option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.code} - {p.description} (Stock: {p.stockQty})</option>
                ))}
              </Select>
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="reqQty">Qty</Label>
              <Input id="reqQty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
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
      <CardHeader><CardTitle>Parts requests</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {partsRequests.map((pr: any) => (
            <div key={pr._id} className="rounded-[10px] border border-line p-3.5">
              <div className="flex items-center justify-between gap-3">
                <Badge dot variant={PARTS_REQUEST_VARIANTS[pr.status as PartsRequestStatus] ?? 'secondary'}>
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
              <div className="mt-2 text-[13px] text-body">
                {pr.items.map((item: any, idx: number) => (
                  <span key={idx} className="mr-3">{item.qty}x part</span>
                ))}
              </div>
              {pr.note && <p className="mt-1 text-xs text-mute">Note: {pr.note}</p>}
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
    return (
      <Card>
        <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
        <CardContent>
          {!canFinance ? (
            <p className="text-[13px] text-mute">Invoice has not been generated yet.</p>
          ) : !hasItems ? (
            <p className="text-[13px] text-mute">Add parts or labour before generating an invoice.</p>
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
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Invoice</CardTitle>
        <Badge dot variant={invoice.approved ? 'success' : 'warning'}>
          {invoice.approved ? 'Approved' : 'Pending Approval'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-[10px] border border-line-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((li: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="text-body">{li.description}</TableCell>
                  <TableCell className="[font-variant-numeric:tabular-nums]">{li.qty}</TableCell>
                  <TableCell className="text-right [font-variant-numeric:tabular-nums]">{formatNaira(li.unitPrice)}</TableCell>
                  <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">{formatNaira(li.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-mute">Parts total</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.partsTotal)}</span></div>
          <div className="flex justify-between"><span className="text-mute">Labour total</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.labourTotal)}</span></div>
          <div className="flex justify-between"><span className="text-mute">Subtotal</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-mute">VAT</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.vat)}</span></div>
          <div className="flex justify-between border-t border-line pt-1.5 text-sm font-extrabold text-ink"><span>Grand total</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.grandTotal)}</span></div>
          <div className="flex justify-between font-semibold text-emerald-600"><span>Paid</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(invoice.amountPaid)}</span></div>
          <div className="flex justify-between font-bold text-ink"><span>Balance</span><span className="[font-variant-numeric:tabular-nums]">{formatNaira(balance)}</span></div>
        </div>

        {/* approve */}
        {canFinance && !invoice.approved && (
          <Button onClick={() => approve.mutate({ invoiceId: invoice._id }, {
            onSuccess: () => { toast.success('Invoice approved.'); void queryClient.invalidateQueries() },
          })} disabled={approve.isPending}>
            {approve.isPending ? 'Approving...' : 'Approve Invoice'}
          </Button>
        )}

        {/* record payment */}
        {canFinance && invoice.approved && balance > 0 && (
          <div className="flex items-end gap-3 border-t border-line-soft pt-4">
            <div className="w-44 space-y-2">
              <Label htmlFor="method">Method</Label>
              <Select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </Select>
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

        {/* payments history */}
        {payments.length > 0 && (
          <div className="border-t border-line-soft pt-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-mute">Payment history</p>
            <div className="space-y-1">
              {payments.map((pmt: any) => (
                <div key={pmt._id} className="flex justify-between text-[13px]">
                  <span className="text-body">{formatDateTime(pmt.ts)} · <span className="capitalize">{pmt.method}</span></span>
                  <span className="font-bold text-ink [font-variant-numeric:tabular-nums]">{formatNaira(pmt.amount)}</span>
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
      <CardContent className="pt-[18px]">
        <Button onClick={() => markPaid.mutate({ jobId: jobId as Id<'jobs'> }, {
          onSuccess: () => { toast.success('Job marked as paid.'); void queryClient.invalidateQueries() },
        })} disabled={markPaid.isPending}>
          {markPaid.isPending ? 'Updating...' : 'Mark Job as Paid'}
        </Button>
      </CardContent>
    </Card>
  )
}
