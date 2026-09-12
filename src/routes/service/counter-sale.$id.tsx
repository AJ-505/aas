import { useState } from 'react'
import { Link, createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useCurrentUser } from '~/lib/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
import { IconChevronRight } from '~/components/icons'
import { PrintableProformaInvoice } from '~/components/PrintableProformaInvoice'
import {
  counterSaleQueries,
  useCancelCounterSaleMutation,
} from '~/lib/queries'
import { formatDateTime, formatNaira } from '~/lib/format'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/counter-sale/$id')({
  component: CounterSaleDetailPage,
})

function CounterSaleDetailPage() {
  const { id } = Route.useParams()
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(counterSaleQueries.get(id))
  const cancelSale = useCancelCounterSaleMutation()
  const [reason, setReason] = useState('')

  if (
    user?.role &&
    user.role !== 'audit' &&
    !['csr', 'admin'].includes(user.role)
  ) {
    return <Navigate to="/" />
  }

  const isAdmin = user?.role === 'admin'

  if (isLoading) return <Loader />
  if (!data?.sale) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Counter sale not found.</p>
        <Link to="/service/counter-sales" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to counter sales
        </Link>
      </div>
    )
  }

  const sale: any = data.sale

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
              {sale.proformaNumber}
            </h1>
            <Badge variant={sale.status === 'cancelled' ? 'destructive' : 'success'}>
              {sale.status === 'cancelled' ? 'Cancelled' : 'Completed'}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-mute">{formatDateTime(sale.ts)}</p>
        </div>
        <div className="flex items-center gap-3">
          <PrintableProformaInvoice sale={sale} createdBy={data.createdBy} />
          <Link
            to="/service/counter-sales"
            className="flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
          >
            <IconChevronRight size={13} className="rotate-180" /> Back to counter sales
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-mute">Customer</dt>
              <dd className="font-semibold text-ink">
                {sale.customerId ? (
                  <Link
                    to="/service/customer/$id"
                    params={{ id: sale.customerId }}
                    className="text-accent hover:underline"
                  >
                    {sale.customerName || 'Customer'}
                  </Link>
                ) : (
                  sale.customerName || 'Walk-in Customer'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Phone</dt>
              <dd className="font-semibold text-ink">{sale.customerPhone || '-'}</dd>
            </div>
            <div>
              <dt className="text-mute">Payment Method</dt>
              <dd className="font-semibold capitalize text-ink">{sale.paymentMethod || '-'}</dd>
            </div>
            <div>
              <dt className="text-mute">Recorded By</dt>
              <dd className="font-semibold text-ink">
                {data.createdBy?.name ?? data.createdBy?.email ?? '-'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.lineItems.map((item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-[12px] font-bold text-accent">
                  {item.code}
                </TableCell>
                <TableCell className="text-body">{item.description}</TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNaira(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-ink">
                  {formatNaira(item.lineTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardContent className="border-t border-line-soft">
          <div className="ml-auto w-64 space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-mute">Subtotal</span>
              <span className="font-mono">{formatNaira(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">VAT</span>
              <span className="font-mono">{formatNaira(sale.vat)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 font-bold text-ink">
              <span>Grand Total</span>
              <span className="font-mono">{formatNaira(sale.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && sale.status !== 'cancelled' && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Counter Sale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[13px] text-mute">
              Cancelling reverses the stock deducted for this sale. A reason is required and
              recorded in the audit log.
            </p>
            <div className="max-w-md space-y-1">
              <Label htmlFor="cancel-reason">Reason (min 10 characters)</Label>
              <Input
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Duplicate entry created by mistake"
              />
            </div>
            <Button
              variant="outline"
              disabled={cancelSale.isPending}
              onClick={async () => {
                try {
                  await cancelSale.mutateAsync({
                    counterSaleId: sale._id as Id<'counterSales'>,
                    reason,
                  })
                  toast.success('Counter sale cancelled and stock reversed.')
                  setReason('')
                  void queryClient.invalidateQueries()
                } catch (err: any) {
                  toast.error(err?.message ?? 'Failed to cancel counter sale.')
                }
              }}
            >
              {cancelSale.isPending ? 'Cancelling...' : 'Cancel Counter Sale'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
