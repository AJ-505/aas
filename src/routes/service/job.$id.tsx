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
  useDiagnoseMutation,
  useMarkReadyMutation,
  useCompleteMutation,
  useAddJobItemMutation,
  useRemoveJobItemMutation,
  useGenerateInvoiceMutation,
  useRegenerateInvoiceMutation,
  useApproveInvoiceMutation,
  useRecordPaymentMutation,
  useMarkPaidMutation,
} from '~/lib/queries'
import { PrintableJobCard } from '~/components/PrintableJobCard'
import { PrintableInvoice } from '~/components/PrintableInvoice'
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_ITEM_TYPE_LABELS,
  type JobStatus,
} from '~/lib/enums'
import { JOB_STATUS_VARIANTS } from '~/lib/status-ui'
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
        <Link to="/service/jobs" search={{}} className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to jobs
        </Link>
      </div>
    )
  }

  const { job, vehicle, customer, diagnosedBy, csr, jobItems, invoice, payments } = data

  const canDiagnose =
    me?.role === 'admin' ||
    me?.role === 'manager' ||
    me?.role === 'inventoryManager'

  const canAddItems = ['inventoryManager', 'finance', 'manager', 'admin'].includes(me?.role ?? '')
  const canAddParts = ['inventoryManager', 'manager', 'admin'].includes(me?.role ?? '')
  const canSeeInvoice = true
  const canPrintJobCard = ['manager', 'inventoryManager', 'csr', 'admin'].includes(me?.role ?? '')

  const allowedNext = nextStatuses(job.status as JobStatus)

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/service/jobs"
            search={{}}
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
            {diagnosedBy ? ` · Diagnosed by: ${diagnosedBy.name}` : ''}
            {csr ? ` · Front desk: ${csr.name}` : ''}
          </p>
        </div>

        {canPrintJobCard && (
          <PrintableJobCard
            job={job}
            vehicle={vehicle}
            customer={customer}
            csr={csr}
          />
        )}
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
                  <p className="text-mute">Phone: <span className="text-body">{customer.phone}</span></p>
                  {customer.email && <p className="text-mute">Email: <span className="text-body">{customer.email}</span></p>}
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

      {/* diagnosis form */}
      {job.status === 'checkedIn' && canDiagnose && (
        <DiagnosisForm jobId={job._id} />
      )}

      {/* add spare parts form - only for inventoryManager/manager/admin */}
      {['checkedIn', 'diagnosed', 'inProgress'].includes(job.status) && canAddParts && (
        <AddPartForm jobId={job._id} />
      )}

      {/* job items (parts + labour) */}
      {['diagnosed', 'inProgress'].includes(job.status) && canAddItems && (
        <AddJobItemForm jobId={job._id} />
      )}

      <JobItemsTable jobItems={jobItems} canRemove={canAddItems && ['checkedIn', 'diagnosed', 'inProgress'].includes(job.status)} />

      {/* invoice */}
      {job.status !== 'checkedIn' && canSeeInvoice && (
        <InvoiceSection
          jobId={job._id}
          invoice={invoice}
          job={job}
          customer={customer}
          vehicle={vehicle}
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
  const markReady = useMarkReadyMutation()
  const complete = useCompleteMutation()

  function invalidate() {
    void queryClient.invalidateQueries()
  }

  function handleTransition(target: JobStatus) {
    const opts = { onSuccess: () => { toast.success(`Job moved to ${JOB_STATUS_LABELS[target]}`); invalidate() } }
    if (target === 'readyForPickup') markReady.mutate({ jobId: jobId as Id<'jobs'> }, opts)
    else if (target === 'completed') complete.mutate({ jobId: jobId as Id<'jobs'> }, opts)
  }

  const role = me?.role
  const canMarkReady = role === 'inventoryManager' || role === 'manager' || role === 'admin'
  const canComplete = role === 'manager' || role === 'admin'

  return (
    <Card>
      <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
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



function DiagnosisForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const diagnose = useDiagnoseMutation()
  const [diagnosis, setDiagnosis] = useState('')

  function handleSubmit(e: React.ChangeEvent) {
    e.preventDefault()
    if (!diagnosis.trim()) { toast.error('Diagnosis cannot be empty.'); return }
    diagnose.mutate({ jobId: jobId as Id<'jobs'>, diagnosis: diagnosis.trim() }, {
      onSuccess: () => { toast.success('Diagnosis saved.'); 
      setDiagnosis('');
      void queryClient.invalidateQueries() },
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
  const { data: labourTypes } = useQuery(labourTypeQueries.list())
  const addJobItem = useAddJobItemMutation()
  const [labourTypeId, setLabourTypeId] = useState('')

  const selectedLabour = labourTypes?.find((lt: any) => lt._id === labourTypeId)
  const unitPrice = selectedLabour?.fixedPrice ?? 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!labourTypeId) { toast.error('Select a labour type.'); return }
    addJobItem.mutate({
      jobId: jobId as Id<'jobs'>,
      type: 'labour',
      labourTypeId: labourTypeId as Id<'labourTypes'>,
      qty: 1,
      unitPrice,
    }, {
      onSuccess: () => { toast.success('Labour cost added.'); setLabourTypeId(''); void queryClient.invalidateQueries() },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add labour cost</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="labour">Labour type</Label>
            <Select id="labour" value={labourTypeId} onChange={(e) => setLabourTypeId(e.target.value)}>
              <option value="" disabled>Select labour type...</option>
              {labourTypes?.map((lt: any) => (
                <option key={lt._id} value={lt._id}>{lt.name} ({formatNaira(lt.fixedPrice)})</option>
              ))}
            </Select>
          </div>
          {labourTypeId && (
            <div className="text-[13px] text-mute">
              Labour cost: <span className="font-bold text-ink">{formatNaira(unitPrice)}</span>
            </div>
          )}
          <Button type="submit" disabled={addJobItem.isPending}>
            {addJobItem.isPending ? 'Adding...' : 'Add Labour Cost'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AddPartForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient()
  const { data: parts } = useQuery(partQueries.list())
  const addJobItem = useAddJobItemMutation()
  const [partId, setPartId] = useState('')
  const [qty, setQty] = useState(1)

  const selectedPart = parts?.find((p: any) => p._id === partId)
  const unitPrice = selectedPart?.sellingPrice ?? 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!partId) { toast.error('Select a part.'); return }
    addJobItem.mutate({
      jobId: jobId as Id<'jobs'>,
      type: 'part',
      partId: partId as Id<'parts'>,
      qty,
      unitPrice,
    }, {
      onSuccess: () => { toast.success('Part added to job.'); setPartId(''); setQty(1); void queryClient.invalidateQueries() },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Add spare part</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="partSelect">Part</Label>
              <Select id="partSelect" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="" disabled>Select part...</option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.code} - {p.description} (Stock: {p.stockQty})</option>
                ))}
              </Select>
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="partQty">Qty</Label>
              <Input id="partQty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
          </div>
          {partId && (
            <div className="text-[13px] text-mute">
              Unit price: <span className="font-bold text-ink">{formatNaira(unitPrice)}</span>
              {' · '}Total: <span className="font-bold text-ink">{formatNaira(unitPrice * qty)}</span>
            </div>
          )}
          <Button type="submit" disabled={addJobItem.isPending}>
            {addJobItem.isPending ? 'Adding...' : 'Add Part to Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function JobItemsTable({ jobItems, canRemove }: { jobItems: any[]; canRemove: boolean }) {
  const queryClient = useQueryClient()
  const removeItem = useRemoveJobItemMutation()
  const { data: parts } = useQuery(partQueries.list())
  const { data: labourTypes } = useQuery(labourTypeQueries.list())

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
            {canRemove && <TableHead className="w-32 text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobItems.map((item: any) => {
            let desc = '-'
            if (item.type === 'part') {
              const part = parts?.find((p: any) => p._id === item.partId)
              desc = part ? `${part.code} - ${part.description}` : item.description || 'Part'
            } else if (item.type === 'labour') {
              const lt = labourTypes?.find((l: any) => l._id === item.labourTypeId)
              desc = lt ? lt.name : item.description || 'Labour'
            }

            return (
              <TableRow key={item._id}>
                <TableCell>
                  <Badge variant={item.type === 'part' ? 'info' : 'violet'}>
                    {JOB_ITEM_TYPE_LABELS[item.type as keyof typeof JOB_ITEM_TYPE_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-ink">{desc}</TableCell>
                <TableCell className="[font-variant-numeric:tabular-nums]">{item.qty}</TableCell>
                <TableCell className="text-right [font-variant-numeric:tabular-nums]">{formatNaira(item.unitPrice)}</TableCell>
                <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">{formatNaira(item.lineTotal)}</TableCell>
                {canRemove && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => removeItem.mutate({ jobItemId: item._id }, {
                        onSuccess: () => { toast.success('Item removed.'); void queryClient.invalidateQueries() },
                        onError: (err) => toast.error(err.message),
                      })}
                    >
                      Remove
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}



function InvoiceSection({ jobId, invoice, job, customer, vehicle, payments, hasItems }: {
  jobId: string
  invoice: any
  job?: any
  customer?: any
  vehicle?: any
  payments: any[]
  hasItems: boolean
}) {
  const queryClient = useQueryClient()
  const { data: me } = useCurrentUser()
  const generate = useGenerateInvoiceMutation()
  const regenerate = useRegenerateInvoiceMutation()
  const approve = useApproveInvoiceMutation()
  const recordPayment = useRecordPaymentMutation()
  const [method, setMethod] = useState<"cash" | "transfer" | "card" | "pos" | "bank">('cash')

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
        <PrintableInvoice
          invoice={invoice}
          job={job}
          customer={customer}
          vehicle={vehicle}
          payments={payments}
        />
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

        {/* approve / regenerate */}
        {canFinance && (
          <div className="flex flex-wrap gap-2 pt-2">
            {!invoice.approved && (
              <Button onClick={() => approve.mutate({ invoiceId: invoice._id }, {
                onSuccess: () => { toast.success('Invoice approved.'); void queryClient.invalidateQueries() },
              })} disabled={approve.isPending}>
                {approve.isPending ? 'Approving...' : 'Approve Invoice'}
              </Button>
            )}

            {!invoice.paid && (
              <Button
                variant="outline"
                onClick={() => regenerate.mutate({ jobId: jobId as Id<'jobs'> }, {
                  onSuccess: () => { toast.success('Invoice regenerated with current job items.'); void queryClient.invalidateQueries() },
                })}
                disabled={regenerate.isPending}
              >
                {regenerate.isPending ? 'Regenerating...' : 'Regenerate Invoice'}
              </Button>
            )}
          </div>
        )}

        {/* record payment */}
        {canFinance && invoice.approved && balance > 0 && (
          <div className="flex items-end gap-3 border-t border-line-soft pt-4">
            <div className="w-44 space-y-2">
              <Label htmlFor="method">Method</Label>
              <Select id="method" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </Select>
            </div>
            <Button onClick={() => {
              const amount = balance
              recordPayment.mutate({ invoiceId: invoice._id, amount, method: method as any }, {
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
