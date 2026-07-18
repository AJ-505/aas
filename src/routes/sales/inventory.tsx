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
import { vehicleQueries } from '~/lib/queries'
import { VEHICLE_STATUS_LABELS, type VehicleStatus } from '~/lib/enums'
import { VEHICLE_STATUS_VARIANTS } from '~/lib/status-ui'
export const Route = createFileRoute('/sales/inventory')({
  component: SalesInventoryPage,
})

function SalesInventoryPage() {
  const navigate = useNavigate()
  const { data: vehicles, isLoading } = useQuery(vehicleQueries.inventory())

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Vehicle Inventory</h1>
        <p className="mt-1 text-[13px] text-mute">
          {vehicles ? `${vehicles.length} vehicles` : 'Track stock for sale.'}
        </p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}><Loader /></TableCell>
              </TableRow>
            ) : !vehicles || vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">No vehicles in inventory.</TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v._id}>
                  <TableCell className="whitespace-nowrap font-semibold text-ink">
                    {v.make} {v.model}
                  </TableCell>
                  <TableCell className="text-body">{v.year}</TableCell>
                  <TableCell className="text-body">{v.color}</TableCell>
                  <TableCell className="text-mute">{v.plate ?? '-'}</TableCell>
                  <TableCell className="text-right text-body">
                    {v.cost != null ? `NGN ${(v.cost / 100).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-body">
                    {v.sellingPrice != null ? `NGN ${(v.sellingPrice / 100).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge dot variant={VEHICLE_STATUS_VARIANTS[v.status as VehicleStatus] ?? 'secondary'}>
                      {VEHICLE_STATUS_LABELS[v.status]}
                    </Badge>
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
