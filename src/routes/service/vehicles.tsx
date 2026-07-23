import { useState } from 'react'
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

export const Route = createFileRoute('/service/vehicles')({
  component: CustomerVehiclesPage,
})

function CustomerVehiclesPage() {
  const navigate = useNavigate()
  const { data: vehiclesData, isLoading } = useQuery(vehicleQueries.inventory())

  const customerVehicles = (vehiclesData ?? []).filter(
    (v: any) => v.status === 'customerOwned',
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Customer Vehicles</h1>
        <p className="mt-1 text-[13px] text-mute">
          {vehiclesData ? `${customerVehicles.length} vehicles registered for repair & service` : 'Track customer vehicles.'}
        </p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}><Loader /></TableCell>
              </TableRow>
            ) : customerVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-mute">
                  No customer-owned vehicles registered.
                </TableCell>
              </TableRow>
            ) : (
              customerVehicles.map((v: any) => (
                <TableRow
                  key={v._id}
                  className={v.ownerId ? 'cursor-pointer' : undefined}
                  onClick={() => {
                    if (v.ownerId) {
                      navigate({ to: '/service/customer/$id', params: { id: v.ownerId } })
                    }
                  }}
                >
                  <TableCell className="whitespace-nowrap font-semibold text-ink">
                    {v.make} {v.model}
                  </TableCell>
                  <TableCell className="text-body">{v.year}</TableCell>
                  <TableCell className="text-body">{v.color}</TableCell>
                  <TableCell className="font-mono text-mute">{v.plate ?? '-'}</TableCell>
                  <TableCell className="font-mono text-[12px] text-mute">{v.vin ?? '-'}</TableCell>
                  <TableCell>
                    <Badge dot variant={VEHICLE_STATUS_VARIANTS[v.status as VehicleStatus] ?? 'secondary'}>
                      {VEHICLE_STATUS_LABELS[v.status as VehicleStatus]}
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
