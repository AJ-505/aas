import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormik } from 'formik'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { FieldError, zodToFormikValidate } from '~/lib/formik-helpers'
import { normalizeCustomerCreateInput } from '~/lib/customer-create'
import { customerQueries, useCreateCustomerMutation } from '~/lib/queries'

export interface SelectedCustomer {
  _id: string
  name: string
  phone: string
  email?: string
  address?: string
}

const inlineSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .regex(/^[\d\s+\-()]+$/, 'Phone must contain only numbers, spaces, +, -, ( )')
    .refine(
      (v) => {
        const d = v.replace(/\D/g, '')
        return d.length >= 7 && d.length <= 15
      },
      { message: 'Phone must be 7-15 digits' },
    ),
  email: z.string().trim().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
})

/**
 * Search-first customer picker shared by walk-in flows. The CSR must search
 * before selecting, which guarantees the person is recorded in `customers`
 * (either matched or created inline) for future visits.
 */
export function CustomerGate({
  selected,
  onSelect,
  title = 'Customer (required) — search first',
  hint = 'Search by name and phone, pick an existing customer, or create inline after viewing results.',
  requiredMessage = 'Search for a customer first.',
}: {
  selected: SelectedCustomer | null
  onSelect: (c: SelectedCustomer | null) => void
  title?: string
  hint?: string
  requiredMessage?: string
}) {
  const createCustomer = useCreateCustomerMutation()
  const [customerQ, setCustomerQ] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const { data: searchResults } = useQuery({
    ...customerQueries.search(customerQ.trim()),
    enabled: hasSearched && customerQ.trim().length > 0,
  })

  function doSearch() {
    if (!customerQ.trim()) {
      toast.error('Enter name or phone to search')
      return
    }
    setHasSearched(true)
  }

  const inlineFormik = useFormik({
    initialValues: { name: '', phone: '', email: '', address: '' },
    validate: zodToFormikValidate(inlineSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const normalized = normalizeCustomerCreateInput(values)
      if (!normalized.name || !normalized.phone) {
        toast.error('Name and phone required to create customer')
        setSubmitting(false)
        return
      }
      try {
        const id = await createCustomer.mutateAsync(normalized)
        onSelect({
          _id: id as string,
          name: normalized.name,
          phone: normalized.phone,
          email: normalized.email,
          address: normalized.address,
        })
        resetForm()
        toast.success('Customer created and selected.')
      } catch (e: any) {
        const data = e?.data
        if (data?.existingCustomerId) {
          toast.error(data.message ?? 'Duplicate customer')
          onSelect({
            _id: data.existingCustomerId,
            name: data.existingName ?? normalized.name,
            phone: data.existingPhone ?? normalized.phone,
            email: normalized.email,
            address: normalized.address,
          })
        } else {
          toast.error(e?.message ?? 'Failed to create customer')
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <Label className="text-[12px] font-bold tracking-wide text-ink">{title}</Label>
      <p className="mt-1 text-[12.5px] text-mute">{hint}</p>
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Search name or phone..."
          value={customerQ}
          onChange={(e) => setCustomerQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              doSearch()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={doSearch}>
          Search
        </Button>
      </div>

      {hasSearched && (
        <div className="mt-3 rounded-lg border border-line bg-surface p-3">
          {!customerQ.trim() ? (
            <p className="text-[12.5px] text-mute">Enter a term.</p>
          ) : searchResults === undefined ? (
            <p className="text-[12.5px] text-mute">Searching...</p>
          ) : searchResults.length === 0 ? (
            <form onSubmit={inlineFormik.handleSubmit} className="space-y-3" noValidate>
              <p className="text-[12.5px] font-medium text-emerald-700">
                No matches — create customer inline:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Input
                    placeholder="Full name *"
                    name="name"
                    value={inlineFormik.values.name}
                    onChange={inlineFormik.handleChange}
                    onBlur={inlineFormik.handleBlur}
                    aria-invalid={!!(inlineFormik.touched.name && inlineFormik.errors.name)}
                  />
                  <FieldError touched={inlineFormik.touched.name} error={inlineFormik.errors.name} />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Phone *"
                    name="phone"
                    value={inlineFormik.values.phone}
                    onChange={inlineFormik.handleChange}
                    onBlur={inlineFormik.handleBlur}
                    aria-invalid={!!(inlineFormik.touched.phone && inlineFormik.errors.phone)}
                  />
                  <FieldError touched={inlineFormik.touched.phone} error={inlineFormik.errors.phone} />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={inlineFormik.values.email}
                    onChange={inlineFormik.handleChange}
                    onBlur={inlineFormik.handleBlur}
                    aria-invalid={!!(inlineFormik.touched.email && inlineFormik.errors.email)}
                  />
                  <FieldError touched={inlineFormik.touched.email} error={inlineFormik.errors.email} />
                </div>
                <Input
                  placeholder="Address"
                  name="address"
                  value={inlineFormik.values.address}
                  onChange={inlineFormik.handleChange}
                  onBlur={inlineFormik.handleBlur}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={inlineFormik.isSubmitting || createCustomer.isPending}
              >
                {inlineFormik.isSubmitting || createCustomer.isPending
                  ? 'Creating...'
                  : 'Create customer'}
              </Button>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-mute">
                {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
              </p>
              {searchResults.slice(0, 6).map((c) => {
                const active = selected?._id === c._id
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() =>
                      onSelect({
                        _id: c._id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        address: c.address,
                      })
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                      active
                        ? 'border-accent bg-accent-soft'
                        : 'border-line bg-surface hover:bg-bg'
                    }`}
                  >
                    <span className="text-[13px] font-semibold text-ink">
                      {c.name}{' '}
                      <span className="font-normal text-mute">· {c.phone}</span>
                    </span>
                    {active && (
                      <span className="text-[11px] font-bold text-accent">Selected</span>
                    )}
                  </button>
                )
              })}
              <form
                onSubmit={inlineFormik.handleSubmit}
                className="space-y-2 border-t border-line-soft pt-3"
                noValidate
              >
                <p className="mb-2 text-[12px] font-semibold text-ink">
                  Or create new (after seeing results):
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Input
                      placeholder="Full name *"
                      name="name"
                      value={inlineFormik.values.name}
                      onChange={inlineFormik.handleChange}
                      onBlur={inlineFormik.handleBlur}
                      aria-invalid={!!(inlineFormik.touched.name && inlineFormik.errors.name)}
                    />
                    <FieldError touched={inlineFormik.touched.name} error={inlineFormik.errors.name} />
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Phone *"
                      name="phone"
                      value={inlineFormik.values.phone}
                      onChange={inlineFormik.handleChange}
                      onBlur={inlineFormik.handleBlur}
                      aria-invalid={!!(inlineFormik.touched.phone && inlineFormik.errors.phone)}
                    />
                    <FieldError touched={inlineFormik.touched.phone} error={inlineFormik.errors.phone} />
                  </div>
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={inlineFormik.values.email}
                    onChange={inlineFormik.handleChange}
                    onBlur={inlineFormik.handleBlur}
                  />
                  <Input
                    placeholder="Address"
                    name="address"
                    value={inlineFormik.values.address}
                    onChange={inlineFormik.handleChange}
                    onBlur={inlineFormik.handleBlur}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="mt-2"
                  variant="outline"
                  disabled={inlineFormik.isSubmitting || createCustomer.isPending}
                >
                  {inlineFormik.isSubmitting || createCustomer.isPending
                    ? 'Creating...'
                    : 'Create & select'}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="text-[13px] font-semibold text-emerald-800">
            {selected.name} · {selected.phone}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Change
          </Button>
        </div>
      )}
      {!hasSearched && (
        <p className="mt-2 text-[11.5px] font-medium text-amber-700">{requiredMessage}</p>
      )}
      {hasSearched && !selected && (
        <p className="mt-2 text-[11.5px] font-medium text-amber-700">
          Pick or create a customer to unlock this sale.
        </p>
      )}
    </div>
  )
}
