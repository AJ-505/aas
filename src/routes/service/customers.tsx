import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { customerQueries, useCreateCustomerMutation } from '~/lib/queries'
import { Loader } from '~/components/Loader'

export const Route = createFileRoute('/service/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  const [q, setQ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { data: customers, isLoading } = useQuery(customerQueries.search(q))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setShowCreate((s) => !s)}>
          {showCreate ? 'Close' : 'Add customer'}
        </Button>
      </div>

      {showCreate && <CreateCustomerForm onDone={() => setShowCreate(false)} />}

      <Input
        placeholder="Search by name or phone..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead />
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
                <TableCell colSpan={4} className="text-center text-slate-500">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email ?? '—'}</TableCell>
                  <TableCell>
                    <Link
                      to="/service/customers/$customerId"
                      params={{ customerId: c._id }}
                      className="text-sm font-medium text-slate-900 underline"
                    >
                      View
                    </Link>
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
  const create = useCreateCustomerMutation()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = (formData.get('name') as string).trim()
    const phone = (formData.get('phone') as string).trim()
    const email = (formData.get('email') as string).trim()
    const address = (formData.get('address') as string).trim()
    if (!name || !phone) {
      toast.error('Name and phone are required.')
      return
    }
    await create.mutateAsync(
      { name, phone, email: email || undefined, address: address || undefined },
      {
        onSuccess: () => {
          toast.success('Customer created.')
          void queryClient.invalidateQueries()
          onDone()
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving...' : 'Save customer'}
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
