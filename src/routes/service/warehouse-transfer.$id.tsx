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
import { PrintableWaybill } from '~/components/PrintableWaybill'
import {
  warehouseTransferQueries,
  useCancelWarehouseTransferMutation,
  useMarkTransferReceivedMutation,
} from '~/lib/queries'
import { formatDateTime } from '~/lib/format'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/warehouse-transfer/$id')({
  component: WarehouseTransferDetailPage,
})

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  dispatched: 'warning',
  received: 'success',
  cancelled: 'destructive',
}

function WarehouseTransferDetailPage() {
  const { id } = Route.useParams()
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(warehouseTransferQueries.get(id))
  const markReceived = useMarkTransferReceivedMutation()
  const cancelTransfer = useCancelWarehouseTransferMutation()
  const [reason, setReason] = useState('')

  if (
    user?.role &&
    user.role !== 'audit' &&
    !['csr', 'inventoryManager', 'admin'].includes(user.role)
  ) {
    return <Navigate to="/" />
  }

  const canWrite =
    user?.role === 'csr' || user?.role === 'inventoryManager' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  if (isLoading) return <Loader />
  if (!data?.transfer) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Transfer not found.</p>
        <Link
          to="/service/warehouse-transfers"
          className="text-[13px] font-semibold text-accent hover:underline"
        >
          &larr; Back to warehouse transfers
        </Link>
      </div>
    )
  }

  const transfer: any = data.transfer
  const actionable = canWrite && transfer.status === 'dispatched'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
              {transfer.waybillNumber}
            </h1>
            <Badge dot variant={STATUS_VARIANTS[transfer.status] ?? 'secondary'}>
              {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-mute">
            {transfer.fromLabel} &rarr; {transfer.toLabel} · {formatDateTime(transfer.ts)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PrintableWaybill transfer={transfer} />
          <Link
            to="/service/warehouse-transfers"
            className="flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
          >
            <IconChevronRight size={13} className="rotate-180" /> Back to transfers
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
              <dt className="text-mute">From</dt>
              <dd className="font-semibold text-ink">{transfer.fromLabel}</dd>
            </div>
            <div>
              <dt className="text-mute">To</dt>
              <dd className="font-semibold text-ink">{transfer.toLabel}</dd>
            </div>
            <div>
              <dt className="text-mute">Dispatched By</dt>
              <dd className="font-semibold text-ink">
                {data.createdBy?.name ?? data.createdBy?.email ?? '-'}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Received By</dt>
              <dd className="font-semibold text-ink">
                {data.receivedBy?.name ?? data.receivedBy?.email ?? '—'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Transfer Items</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">S/N</TableHead>
              <TableHead>Part No</TableHead>
              <TableHead>Part Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfer.lineItems.map((item: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell className="font-mono text-[12px] font-bold text-accent">
                  {item.code}
                </TableCell>
                <TableCell className="text-body">{item.description}</TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-body">{item.unit || '-'}</TableCell>
                <TableCell className="text-body">{item.remarks || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {actionable && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button
                disabled={markReceived.isPending}
                onClick={async () => {
                  try {
                    await markReceived.mutateAsync({
                      transferId: transfer._id as Id<'warehouseTransfers'>,
                    })
                    toast.success('Transfer marked as received.')
                    void queryClient.invalidateQueries()
                  } catch (err: any) {
                    toast.error(err?.message ?? 'Failed to update transfer.')
                  }
                }}
              >
                {markReceived.isPending ? 'Saving...' : 'Mark Received'}
              </Button>
            </div>

            {isAdmin && (
              <div className="space-y-2 border-t border-line-soft pt-4">
                <p className="text-[13px] text-mute">
                  Cancelling a dispatched transfer returns its parts to stock. A reason is
                  required and recorded in the audit log.
                </p>
                <div className="max-w-md space-y-1">
                  <Label htmlFor="transfer-cancel-reason">Cancellation reason (min 10 characters)</Label>
                  <Input
                    id="transfer-cancel-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Wrong destination selected"
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={cancelTransfer.isPending}
                  onClick={async () => {
                    try {
                      await cancelTransfer.mutateAsync({
                        transferId: transfer._id as Id<'warehouseTransfers'>,
                        reason,
                      })
                      toast.success('Transfer cancelled and stock restored.')
                      setReason('')
                      void queryClient.invalidateQueries()
                    } catch (err: any) {
                      toast.error(err?.message ?? 'Failed to cancel transfer.')
                    }
                  }}
                >
                  {cancelTransfer.isPending ? 'Cancelling...' : 'Cancel Transfer'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
