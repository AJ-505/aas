import { useState } from 'react'
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { customerQueries, useCheckInMutation } from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/checkin')({
  component: CheckInPage,
})

function CheckInPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const checkIn = useCheckInMutation()

  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [complaint, setComplaint] = useState('')

  const { data: customers } = useQuery({
    ...customerQueries.search(search),
    enabled: search.length > 0,
  })

  const { data: customerDetail } = useQuery({
    ...customerQueries.detail(selectedCustomerId ?? ''),
    enabled: !!selectedCustomerId,
  })

  const selectedCustomer = customerDetail?.customer ?? null
  const vehicles = customerDetail?.vehicles ?? []

  async function handleSubmit() {
    if (!selectedVehicleId || !selectedCustomerId || !complaint.trim()) {
      toast.error('Please select a customer, vehicle, and enter a complaint.')
      return
    }
    checkIn.mutate(
      { vehicleId: selectedVehicleId as Id<'vehicles'>, customerId: selectedCustomerId as Id<'customers'>, complaint: complaint.trim() },
      {
        onSuccess: (jobId) => {
          toast.success('Job checked in successfully.')
          void queryClient.invalidateQueries()
          navigate({ to: '/service/job/$id', params: { id: jobId } })
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to check in job.')
        },
      },
    )
  }

  function handleSelectCustomer(id: string) {
    setSelectedCustomerId(id)
    setSelectedVehicleId(null)
    setSearch('')
  }

  const customerName = selectedCustomer
    ? `${selectedCustomer.name}${selectedCustomer.phone ? ` (${selectedCustomer.phone})` : ''}`
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check In Vehicle</h1>
          <p className="text-sm text-slate-500">Create a new workshop job for a vehicle.</p>
        </div>
        <Link to="/service/jobs" className="text-sm font-medium text-slate-900 underline">
          Back to jobs
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {selectedCustomer ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{customerName}</p>
              <Button variant="outline" size="sm" onClick={() => { setSelectedCustomerId(null); setSelectedVehicleId(null) }}>
                Change
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Label htmlFor="search">Search customer by name or phone</Label>
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
              />
              {customers && customers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                  {customers.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                      onClick={() => handleSelectCustomer(c._id)}
                    >
                      {c.name}{c.phone ? ` — ${c.phone}` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomerId && (
        <Card>
          <CardHeader><CardTitle>Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-500">No vehicles found for this customer.</p>
            ) : (
              <div className="grid gap-2">
                {vehicles.map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      selectedVehicleId === v._id
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedVehicleId(v._id)}
                  >
                    <span className="font-medium">
                      {v.make} {v.model} ({v.year})
                    </span>
                    {v.plate && <span className="ml-2 text-slate-500">[{v.plate.toUpperCase()}]</span>}
                    {v.color && <span className="ml-2 text-slate-400">{v.color}</span>}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedVehicleId && (
        <Card>
          <CardHeader><CardTitle>Complaint</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="complaint">Describe the issue</Label>
            <textarea
              id="complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Customer's reported complaint..."
            />
            <Button onClick={handleSubmit} disabled={checkIn.isPending}>
              {checkIn.isPending ? 'Checking in...' : 'Check In Vehicle'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
