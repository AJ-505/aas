import { useState, useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useCurrentUser } from '~/lib/auth'
import { Navigate } from '@tanstack/react-router'
import {
  customerQueries,
  useCreateCustomerMutation,
  useCreateVehicleMutation,
  useCheckInMutation,
} from '~/lib/queries'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import { IconChevronRight, IconPlus, IconSearch } from '~/components/icons'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/service/customers')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: CustomersPage,
})

function CustomersPage() {
  const searchParams = Route.useSearch()
  const [q, setQ] = useState(searchParams.q || '')
  const [showCreate, setShowCreate] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: customers, isLoading } = useQuery(customerQueries.search(q))
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q)
    }
  }, [searchParams.q])

  if (user && user.role === 'salesRep') {
    return <Navigate to="/" />
  }

  const canAdd = ['csr', 'manager', 'admin'].includes(user?.role ?? '')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Customers</h1>
          <p className="mt-1 text-[13px] text-mute">
            {customers ? `${customers.length} registered` : 'Directory of customers and their vehicles.'}
          </p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowCreate((s) => !s)} variant={showCreate ? 'outline' : 'default'}>
            {showCreate ? 'Close' : (<><IconPlus size={15} /> Add customer</>)}
          </Button>
        )}
      </div>

      {showCreate && <CreateCustomerForm onDone={() => setShowCreate(false)} />}

      <div className="relative max-w-sm">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search by name or phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !customers || customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-mute">
                  No customers found{q ? ` for “${q}”` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow
                  key={c._id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/service/customer/$id', params: { id: c._id } })}
                >
                  <TableCell className="whitespace-nowrap">
                    <span className="flex items-center gap-2.5 font-semibold text-ink">
                      <Avatar name={c.name} size={28} />
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-body">{c.phone}</TableCell>
                  <TableCell className="hidden text-mute md:table-cell">{c.email ?? '-'}</TableCell>
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

function CreateCustomerForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const createCustomer = useCreateCustomerMutation()
  const createVehicle = useCreateVehicleMutation()
  const checkIn = useCheckInMutation()
  const navigate = useNavigate()

  const [gateQ, setGateQ] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState<{ id: string; name: string; phone: string } | null>(null)

  const { data: gateResults } = useQuery({
    ...customerQueries.search(gateQ.trim()),
    enabled: hasSearched && gateQ.trim().length > 0,
  })

  function handleGateSearch() {
    if (!gateQ.trim()) {
      toast.error('Enter name or phone to search first.')
      return
    }
    setHasSearched(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasSearched) {
      toast.error('Please search for existing customers first.')
      return
    }
    const formData = new FormData(event.currentTarget)
    const name = (formData.get('name') as string).trim()
    const phone = (formData.get('phone') as string).trim()
    const email = (formData.get('email') as string).trim()
    const address = (formData.get('address') as string).trim()

    if (!name || !phone) {
      toast.error('Name and phone are required.')
      return
    }

    const make = (formData.get('make') as string).trim()
    const model = (formData.get('model') as string).trim()
    const yearStr = (formData.get('year') as string).trim()
    const color = (formData.get('color') as string).trim()
    const plate = (formData.get('plate') as string).trim()
    const vin = (formData.get('vin') as string).trim()
    const complaint = (formData.get('complaint') as string).trim()

    const hasVehicle = make && model && yearStr && color
    if ((make || model || yearStr || color) && !hasVehicle) {
      toast.error('Please fill all required vehicle fields (make, model, year, colour) or leave all empty.')
      return
    }

    try {
      const customerId = await createCustomer.mutateAsync({
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
      })

      let vehicleId: string | null = null
      if (hasVehicle) {
        vehicleId = await createVehicle.mutateAsync({
          ownerId: customerId as Id<'customers'>,
          make,
          model,
          year: Number(yearStr),
          color,
          plate: plate || undefined,
          vin: vin || undefined,
          status: 'customerOwned',
        })
      }

      if (complaint && vehicleId) {
        await checkIn.mutateAsync({
          vehicleId: vehicleId as Id<'vehicles'>,
          customerId: customerId as Id<'customers'>,
          complaint,
        })
        toast.success('Customer, vehicle, and job created.')
        void queryClient.invalidateQueries()
        onDone()
        return
      }

      toast.success('Customer created.')
      if (vehicleId) {
        toast.success('Vehicle added.')
      }
      void queryClient.invalidateQueries()
      onDone()
    } catch (err: any) {
      const raw = err?.message ?? 'Failed to create customer.'
      // ConvexError with structured data may be stringified; try to extract existingCustomerId
      const data = err?.data
      if (data?.existingCustomerId) {
        setDuplicateInfo({ id: data.existingCustomerId, name: data.existingName ?? '', phone: data.existingPhone ?? '' })
        toast.error(data.message ?? raw)
        return
      }
      // Fallback parse ID from message
      const m = raw.match(/Existing customerId:\s*(\w+)/)
      if (m) {
        setDuplicateInfo({ id: m[1]!, name: '', phone: '' })
      }
      toast.error(raw)
    }
  }

  const saving = createCustomer.isPending || createVehicle.isPending || checkIn.isPending
  const gateDone = hasSearched && gateQ.trim().length > 0

  return (
    <Card>
      <CardHeader><CardTitle>New customer</CardTitle></CardHeader>
      <CardContent>
        {/* Mandatory search gate */}
        <div className="mb-6 rounded-xl border border-line bg-bg p-4">
          <Label className="text-[12px] font-bold tracking-wide text-ink">Step 1 — Search existing customers (required)</Label>
          <p className="mt-1 text-[12.5px] text-mute">Search by name <b>and</b> phone to avoid duplicates. View results before the form unlocks.</p>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <Input
                placeholder="Name or phone..."
                value={gateQ}
                onChange={(e) => setGateQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGateSearch() } }}
                className="pl-9"
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleGateSearch}>
              <IconSearch size={14} /> Search
            </Button>
          </div>
          {hasSearched && (
            <div className="mt-3 rounded-lg border border-line bg-surface p-3">
              {!gateQ.trim() ? (
                <p className="text-[12.5px] text-mute">Enter a search term.</p>
              ) : gateResults === undefined ? (
                <p className="text-[12.5px] text-mute">Searching...</p>
              ) : gateResults.length === 0 ? (
                <p className="text-[12.5px] font-medium text-emerald-700">No matches — you can create this customer.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-mute">{gateResults.length} match{gateResults.length !== 1 ? 'es' : ''} — reuse existing if relevant</p>
                  {gateResults.slice(0, 5).map((c) => (
                    <div key={c._id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-ink"><Avatar name={c.name} size={24} />{c.name} <span className="font-normal text-mute">· {c.phone}</span></span>
                      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/service/customer/$id', params: { id: c._id } })}>View</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!hasSearched && <p className="mt-2 text-[11.5px] font-medium text-amber-700">Search required before the create form unlocks.</p>}
        </div>

        {duplicateInfo && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px]">
            <span className="font-semibold text-red-700">Duplicate detected:</span>{' '}
            <span className="text-body">Phone already exists{duplicateInfo.name ? ` for ${duplicateInfo.name}` : ''}.</span>{' '}
            <Link to="/service/customer/$id" params={{ id: duplicateInfo.id }} className="font-semibold text-red-700 underline">Use existing customer</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={!gateDone} className={`${!gateDone ? 'opacity-50' : ''} space-y-6`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
            </div>

            <div className="border-t border-line-soft pt-5">
            <h3 className="mb-3 text-[13px] font-bold text-ink">Vehicle <span className="font-medium text-mute">(optional)</span></h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" name="make" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" min={1900} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Colour</Label>
                <Input id="color" name="color" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Plate</Label>
                <Input id="plate" name="plate" placeholder="LSD-123-HG" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" name="vin" />
              </div>
            </div>
          </div>

          <div className="border-t border-line-soft pt-5">
            <h3 className="mb-3 text-[13px] font-bold text-ink">Complaint <span className="font-medium text-mute">(optional)</span></h3>
            <div className="space-y-2">
              <Label htmlFor="complaint">Describe the issue</Label>
              <Textarea
                id="complaint"
                name="complaint"
                placeholder="Customer's reported complaint..."
              />
            </div>
          </div>
          </fieldset>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !gateDone}>
              {saving ? 'Saving...' : 'Save customer'}
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
