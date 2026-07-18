import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { IconChevronRight } from '~/components/icons'
import {
  salesOrderQueries,
  deliveryQueries,
  useCompleteSalesOrderMutation,
  useCancelSalesOrderMutation,
  useCompleteDeliveryMutation,
} from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/order/$id')({
  component: SalesOrderDetailPage,
})

function SalesOrderDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: order, isLoading, isError, error } = useQuery(salesOrderQueries.get(id))
  const { data: delivery } = useQuery(deliveryQueries.getBySalesOrder(id))
  const completeOrder = useCompleteSalesOrderMutation()
  const cancelOrder = useCancelSalesOrderMutation()
  const completeDelivery = useCompleteDeliveryMutation()

  const [showDelivery, setShowDelivery] = useState(false)

  if (isLoading) return <Loader />
  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">Error: {error?.message}</p>
        <Link to="/sales/orders" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to orders
        </Link>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Order not found.</p>
        <Link to="/sales/orders" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Order #{order._id.slice(-6)}
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            Reserved {new Date(order.reservedTs).toLocaleDateString('en-NG')}
          </p>
        </div>
        <Link
          to="/sales/orders"
          className="flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
        >
          <IconChevronRight size={13} className="rotate-180" /> Back to orders
        </Link>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="text-mute">Agreed Price</dt>
              <dd className="font-semibold text-ink">NGN {(order.agreedPrice / 100).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-mute">Deposit Paid</dt>
              <dd className="font-semibold text-ink">NGN {(order.deposit / 100).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-mute">Balance</dt>
              <dd className="font-semibold text-ink">NGN {(order.balance / 100).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-mute">Status</dt>
              <dd>
                <Badge
                  dot
                  variant={
                    order.status === 'completed'
                      ? 'success'
                      : order.status === 'cancelled'
                        ? 'destructive'
                        : 'warning'
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Actions */}
      {order.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              await completeOrder.mutateAsync(
                { salesOrderId: id as Id<'salesOrders'> },
                {
                  onSuccess: () => {
                    toast.success('Order completed.')
                    void queryClient.invalidateQueries()
                  },
                  onError: (err) => toast.error(err.message),
                },
              )
            }}
            disabled={completeOrder.isPending}
          >
            {completeOrder.isPending ? 'Completing...' : 'Complete'}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await cancelOrder.mutateAsync(
                { salesOrderId: id as Id<'salesOrders'> },
                {
                  onSuccess: () => {
                    toast.success('Order cancelled.')
                    void queryClient.invalidateQueries()
                  },
                  onError: (err) => toast.error(err.message),
                },
              )
            }}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? 'Cancelling...' : 'Cancel'}
          </Button>
        </div>
      )}

      {/* Delivery */}
      {order.status === 'completed' && !delivery && (
        <div className="flex gap-2">
          <Button onClick={() => setShowDelivery(true)}>
            Record delivery
          </Button>
        </div>
      )}

      {showDelivery && (
        <DeliveryForm
          salesOrderId={id}
          onDone={() => {
            setShowDelivery(false)
            void queryClient.invalidateQueries()
          }}
        />
      )}

      {delivery && (
        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent>
            <p className="text-[13px] text-mute">
              Handed over on {new Date(delivery.handedOverTs).toLocaleDateString('en-NG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <ul className="mt-2 space-y-1 text-[13px]">
              <li className={delivery.checklist.keys ? 'text-green-600' : 'text-mute'}>
                {delivery.checklist.keys ? '\u2713' : '\u2717'} Keys
              </li>
              <li className={delivery.checklist.manual ? 'text-green-600' : 'text-mute'}>
                {delivery.checklist.manual ? '\u2713' : '\u2717'} Manual
              </li>
              <li className={delivery.checklist.toolkit ? 'text-green-600' : 'text-mute'}>
                {delivery.checklist.toolkit ? '\u2713' : '\u2717'} Toolkit
              </li>
              <li className={delivery.checklist.inspection ? 'text-green-600' : 'text-mute'}>
                {delivery.checklist.inspection ? '\u2713' : '\u2717'} Inspection
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DeliveryForm({ salesOrderId, onDone }: { salesOrderId: string; onDone: () => void }) {
  const complete = useCompleteDeliveryMutation()
  const [checklist, setChecklist] = useState({
    keys: false,
    manual: false,
    toolkit: false,
    inspection: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await complete.mutateAsync(
      {
        salesOrderId: salesOrderId as Id<'salesOrders'>,
        checklist,
      },
      {
        onSuccess: () => {
          toast.success('Delivery recorded.')
          onDone()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Delivery Handover Checklist</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {(['keys', 'manual', 'toolkit', 'inspection'] as const).map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-lg border border-line-soft p-3 text-[13px] font-medium text-ink"
            >
              <input
                type="checkbox"
                checked={checklist[item]}
                onChange={(e) =>
                  setChecklist((prev) => ({ ...prev, [item]: e.target.checked }))
                }
                className="size-4 rounded border-line accent-accent"
              />
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </label>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={complete.isPending}>
              {complete.isPending ? 'Saving...' : 'Confirm delivery'}
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
