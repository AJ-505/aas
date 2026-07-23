import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { IconChevronRight, IconPlus } from '~/components/icons'
import {
  leadQueries,
  useUpdateLeadStageMutation,
  useLogFollowUpMutation,
} from '~/lib/queries'
import { CreateSalesOrderModal } from '~/routes/sales/orders'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/sales/lead/$id')({
  component: LeadDetailPage,
})

const LEAD_STAGE_VARIANTS: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'violet'> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'violet',
  won: 'success',
  lost: 'destructive',
}

const STAGES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const

function LeadDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: lead, isLoading, isError, error } = useQuery(leadQueries.get(id))
  const updateStage = useUpdateLeadStageMutation()
  const logFollowUp = useLogFollowUpMutation()

  const [followUpNote, setFollowUpNote] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [showCreateOrder, setShowCreateOrder] = useState(false)

  if (isLoading) return <Loader />
  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">Error: {error?.message}</p>
        <Link to="/sales/leads" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to leads
        </Link>
      </div>
    )
  }
  if (!lead) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Lead not found.</p>
        <Link to="/sales/leads" className="text-[13px] font-semibold text-accent hover:underline">
          &larr; Back to leads
        </Link>
      </div>
    )
  }

  async function handleStageChange(newStage: string) {
    await updateStage.mutateAsync(
      { leadId: id as Id<'leads'>, stage: newStage },
      {
        onSuccess: () => {
          toast.success(`Stage changed to ${newStage}.`)
          void queryClient.invalidateQueries()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  async function handleFollowUp(e: React.FormEvent) {
    e.preventDefault()
    if (!followUpNote.trim()) {
      toast.error('Note is required.')
      return
    }
    const nextFollowUpTs = followUpDate
      ? new Date(followUpDate).getTime()
      : undefined
    await logFollowUp.mutateAsync(
      {
        leadId: id as Id<'leads'>,
        note: followUpNote.trim(),
        nextFollowUpTs,
      },
      {
        onSuccess: () => {
          toast.success('Follow-up logged.')
          setFollowUpNote('')
          setFollowUpDate('')
          void queryClient.invalidateQueries()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">{lead.name}</h1>
          <p className="mt-1 text-[13px] text-mute">
            {lead.phone}{lead.email ? ` \u2022 ${lead.email}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateOrder(true)} size="sm">
            <IconPlus size={14} /> Create Sales Order
          </Button>
          <Link
            to="/sales/leads"
            className="flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
          >
            <IconChevronRight size={13} className="rotate-180" /> Back to leads
          </Link>
        </div>
      </div>

      {showCreateOrder && (
        <CreateSalesOrderModal
          initialLeadId={id}
          onDone={() => setShowCreateOrder(false)}
        />
      )}


      {/* Stage management */}
      <Card>
        <CardHeader><CardTitle>Stage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStageChange(s)}
                disabled={lead.stage === s || updateStage.isPending}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
                  lead.stage === s
                    ? 'bg-accent text-white'
                    : 'bg-line-soft text-body hover:bg-line'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card>
        <CardHeader><CardTitle>Follow-up Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFollowUp} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="note">Add note</Label>
              <Textarea
                id="note"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                rows={2}
                required
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Next follow-up date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={logFollowUp.isPending}>
                {logFollowUp.isPending ? 'Saving...' : 'Log note'}
              </Button>
            </div>
          </form>

          {lead.notes.length === 0 ? (
            <p className="text-[13px] text-mute">No follow-ups logged yet.</p>
          ) : (
            <div className="space-y-2">
              {[...lead.notes].reverse().map((n, i) => (
                <div key={i} className="rounded-lg border border-line-soft p-3">
                  <p className="text-[13px] text-body">{n.text}</p>
                  <p className="mt-1 text-[11px] text-mute">
                    {new Date(n.ts).toLocaleString('en-NG')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lead.nextFollowUpTs && (
        <Card>
          <CardHeader><CardTitle>Next Follow-up</CardTitle></CardHeader>
          <CardContent>
            <p className="text-[13px] text-body">
              {new Date(lead.nextFollowUpTs).toLocaleDateString('en-NG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
