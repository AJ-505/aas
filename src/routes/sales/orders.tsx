import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import { Loader } from '~/components/Loader'
import { IconChevronRight } from '~/components/icons'
import { salesOrderQueries } from '~/lib/queries'

export const Route = createFileRoute('/sales/orders')({
  component: SalesOrdersPage,
})

const ORDER_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

function SalesOrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading } = useQuery(salesOrderQueries.list())

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Sales Orders</h1>
        <p className="mt-1 text-[13px] text-mute">
          {orders ? `${orders.length} orders` : 'Track vehicle sales.'}
        </p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Agreed Price</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}><Loader /></TableCell>
              </TableRow>
            ) : !orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No sales orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow
                  key={o._id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/sales/order/$id', params: { id: o._id } })}
                >
                  <TableCell className="whitespace-nowrap font-semibold text-ink">
                    #{o._id.slice(-6)}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.agreedPrice / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.deposit / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-body">
                    NGN {(o.balance / 100).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-[13px] text-mute">
                    {new Date(o.reservedTs).toLocaleDateString('en-NG')}
                  </TableCell>
                  <TableCell>
                    <Badge dot variant={ORDER_STATUS_VARIANTS[o.status] ?? 'secondary'}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 text-mute">
                    <IconChevronRight size={15} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
