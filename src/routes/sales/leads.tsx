import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FieldError, zodToFormikValidate } from '~/lib/formik-helpers'
import { createLeadSchema } from '~/lib/schemas/sales'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { IconChevronRight, IconPlus, IconSearch } from '~/components/icons'
import { leadQueries, useCreateLeadMutation } from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'

import { useCurrentUser } from '~/lib/auth'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/sales/leads')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: LeadsPage,
})

const LEAD_STAGE_VARIANTS: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'violet'> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'violet',
  won: 'success',
  lost: 'destructive',
}

const LEAD_STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
}

function LeadsPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const [q, setQ] = useState(searchParams.q || '')
  const [showCreate, setShowCreate] = useState(false)

  if (user?.role && user.role !== 'audit' && !['salesRep', 'manager', 'admin'].includes(user.role)) {
    return <Navigate to="/" />
  }
  const { data: leads, isLoading } = useQuery(leadQueries.search(q))

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q)
    }
  }, [searchParams.q])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Leads</h1>
          <p className="mt-1 text-[13px] text-mute">
            {leads ? `${leads.length} leads` : 'Track customer enquiries and test drives.'}
          </p>
        </div>
        <Button onClick={() => setShowCreate((s) => !s)}>
          {showCreate ? 'Close' : <><IconPlus size={15} /> Add lead</>}
        </Button>
      </div>

      {showCreate && <CreateLeadForm onDone={() => setShowCreate(false)} />}

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
              <TableHead>Stage</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}><Loader /></TableCell>
              </TableRow>
            ) : !leads || leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-mute">
                  No leads found{q ? ` for "${q}"` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((l) => (
                <TableRow
                  key={l._id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/sales/lead/$id', params: { id: l._id } })}
                >
                  <TableCell className="whitespace-nowrap font-semibold text-ink">{l.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-mute">{l.phone}</TableCell>
                  <TableCell>
                    <Badge dot variant={LEAD_STAGE_VARIANTS[l.stage] ?? 'secondary'}>
                      {LEAD_STAGE_LABELS[l.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-mute">
                    {l.nextFollowUpTs
                      ? new Date(l.nextFollowUpTs).toLocaleDateString('en-NG')
                      : '-'}
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

function CreateLeadForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const create = useCreateLeadMutation()

  const formik = useFormik({
    initialValues: { name: '', phone: '', email: '' },
    validate: zodToFormikValidate(createLeadSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await create.mutateAsync(
          {
            name: values.name.trim(),
            phone: values.phone.trim(),
            email: values.email.trim() || undefined,
            nextFollowUpTs: undefined,
          },
        )
        toast.success('Lead created.')
        void queryClient.invalidateQueries()
        onDone()
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to create lead.')
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <Card>
      <CardHeader><CardTitle>New lead</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.name && formik.errors.name)} />
            <FieldError touched={formik.touched.name} error={formik.errors.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" name="phone" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.phone && formik.errors.phone)} />
            <FieldError touched={formik.touched.phone} error={formik.errors.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.email && formik.errors.email)} />
            <FieldError touched={formik.touched.email} error={formik.errors.email} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={create.isPending || formik.isSubmitting}>
              {create.isPending || formik.isSubmitting ? 'Saving...' : 'Create lead'}
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
