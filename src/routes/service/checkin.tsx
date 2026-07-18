import { useState } from 'react'
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Avatar } from '~/components/Avatar'
import { IconCar, IconCheck, IconChevronRight, IconSearch } from '~/components/icons'
import { customerQueries, useCheckInMutation } from '~/lib/queries'
import { cn } from '~/lib/utils'
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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Check in vehicle</h1>
          <p className="mt-1 text-[13px] text-mute">Create a new workshop job in three steps.</p>
        </div>
        <Link
          to="/service/jobs"
          className="flex items-center gap-1 pt-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
        >
          <IconChevronRight size={13} className="rotate-180" /> Back to jobs
        </Link>
      </div>

      {/* step 1: customer */}
      <StepCard step={1} title="Customer" done={!!selectedCustomer}>
        {selectedCustomer ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Avatar name={selectedCustomer.name} size={36} />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">{selectedCustomer.name}</span>
                <span className="block text-[12px] text-mute">{selectedCustomer.phone}</span>
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={() => { setSelectedCustomerId(null); setSelectedVehicleId(null) }}>
              Change
            </Button>
          </div>
        ) : (
          <div className="relative space-y-2">
            <Label htmlFor="search">Search by name or phone</Label>
            <div className="relative">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
                className="pl-9"
              />
            </div>
            {customers && customers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_12px_32px_rgba(15,18,34,0.12)]">
                {customers.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-bg"
                    onClick={() => handleSelectCustomer(c._id)}
                  >
                    <Avatar name={c.name} size={26} />
                    <span>
                      <span className="block text-[13px] font-semibold text-ink">{c.name}</span>
                      {c.phone && <span className="block text-[11.5px] text-mute">{c.phone}</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {search.length > 0 && customers && customers.length === 0 && (
              <p className="text-[12.5px] text-mute">
                No matches. Add them first from the{' '}
                <Link to="/service/customers" className="font-semibold text-accent hover:underline">Customers</Link> page.
              </p>
            )}
          </div>
        )}
      </StepCard>

      {/* step 2: vehicle */}
      {selectedCustomerId && (
        <StepCard step={2} title="Vehicle" done={!!selectedVehicleId}>
          {vehicles.length === 0 ? (
            <p className="text-[13px] text-mute">No vehicles found for this customer.</p>
          ) : (
            <div className="grid gap-2">
              {vehicles.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors',
                    selectedVehicleId === v._id
                      ? 'border-accent bg-accent-soft'
                      : 'border-line hover:bg-bg',
                  )}
                  onClick={() => setSelectedVehicleId(v._id)}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-lg',
                      selectedVehicleId === v._id ? 'bg-accent text-white' : 'bg-accent-soft text-accent',
                    )}
                  >
                    <IconCar size={15} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-ink">
                      {v.make} {v.model} ({v.year})
                    </span>
                    <span className="block text-[11.5px] text-mute">
                      {v.plate ? v.plate.toUpperCase() : 'No plate'}{v.color ? ` · ${v.color}` : ''}
                    </span>
                  </span>
                  {selectedVehicleId === v._id && (
                    <span className="grid size-5 place-items-center rounded-full bg-accent text-white">
                      <IconCheck size={11} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </StepCard>
      )}

      {/* step 3: complaint */}
      {selectedVehicleId && (
        <StepCard step={3} title="Complaint" done={complaint.trim().length > 0}>
          <div className="space-y-3">
            <Label htmlFor="complaint">Describe the issue</Label>
            <Textarea
              id="complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Customer's reported complaint..."
            />
            <Button onClick={handleSubmit} disabled={checkIn.isPending}>
              {checkIn.isPending ? 'Checking in...' : 'Check In Vehicle'}
            </Button>
          </div>
        </StepCard>
      )}
    </div>
  )
}

function StepCard({
  step,
  title,
  done,
  children,
}: {
  step: number
  title: string
  done: boolean
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5">
        <span
          className={cn(
            'grid size-6 place-items-center rounded-full text-[11px] font-bold',
            done ? 'bg-accent text-white' : 'bg-accent-soft text-accent',
          )}
        >
          {done ? <IconCheck size={12} /> : step}
        </span>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
