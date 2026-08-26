import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Loader } from '~/components/Loader'
import { useCurrentUser } from '~/lib/auth'
import { auditQueries, userQueries } from '~/lib/queries'
import { formatDateTime } from '~/lib/format'

export const Route = createFileRoute('/admin/audit')({
  component: AuditPage,
})

function AuditPage() {
  const { data: user } = useCurrentUser()
  const [tab, setTab] = useState<'audit' | 'activity'>('audit')
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [event, setEvent] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [limit, setLimit] = useState(100)

  const fromTs = fromDate ? new Date(fromDate).getTime() : undefined
  const toTs = toDate ? new Date(toDate + 'T23:59:59').getTime() : undefined

  const { data: users } = useQuery(userQueries.list())
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    ...auditQueries.auditLogs({
      userId: userId || undefined,
      action: action || undefined,
      fromTs,
      toTs,
      limit,
    }),
    enabled: tab === 'audit',
  })
  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    ...auditQueries.activityLogs({
      userId: userId || undefined,
      event: event || undefined,
      fromTs,
      toTs,
      limit,
    }),
    enabled: tab === 'activity',
  })

  if (user?.role && user.role !== 'admin') return <Navigate to="/" />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">Audit log</h1>
        <p className="mt-1 text-[13px] text-mute">
          Business changes (<span className="font-mono text-[11px] bg-line-soft px-1 rounded">auditLogs</span>) and auth/session events (
          <span className="font-mono text-[11px] bg-line-soft px-1 rounded">activityLogs</span>). Admin-only. Activity data is client-supplied
          (UA/screen) and spoofable; IP is only captured on HTTP action routes — pure Convex mutations have no request IP.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'audit' ? 'default' : 'outline'} onClick={() => setTab('audit')}>
          Business audit ({auditLogs?.length ?? '—'})
        </Button>
        <Button variant={tab === 'activity' ? 'default' : 'outline'} onClick={() => setTab('activity')}>
          Activity ({activityLogs?.length ?? '—'})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-1">
            <Label>User</Label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm"
            >
              <option value="">All users</option>
              {(users ?? []).map((u: any) => (
                <option key={u._id} value={u._id}>
                  {u.name ?? u.email ?? u._id.slice(-6)}
                </option>
              ))}
            </select>
          </div>
          {tab === 'audit' ? (
            <div className="space-y-1">
              <Label>Action</Label>
              <Input placeholder="e.g. job.checkIn" value={action} onChange={(e) => setAction(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Event</Label>
              <select value={event} onChange={(e) => setEvent(e.target.value)} className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm">
                <option value="">All events</option>
                <option value="login">login</option>
                <option value="logout">logout</option>
                <option value="login_failed">login_failed</option>
                <option value="session_expired">session_expired</option>
                <option value="password_reset">password_reset</option>
                <option value="totp_change">totp_change</option>
                <option value="totp_enabled">totp_enabled</option>
                <option value="totp_disabled">totp_disabled</option>
              </select>
            </div>
          )}
          <div className="space-y-1">
            <Label>From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Limit</Label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm">
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {tab === 'audit' ? (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-line-soft text-xs text-mute">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Entity</th>
                  <th className="px-3 py-2 text-left">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : !auditLogs || auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-mute">
                      No audit entries match your filters.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((l: any) => (
                    <tr key={l._id} className="border-t border-line text-[13px]">
                      <td className="whitespace-nowrap px-3 py-2 text-mute">{formatDateTime(l.ts)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{l.userId.slice(-6)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{l.action}</td>
                      <td className="px-3 py-2">{l.entity}</td>
                      <td className="px-3 py-2 font-mono text-xs">{l.entityId.slice(-8)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-line-soft text-xs text-mute">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">User / Email</th>
                  <th className="px-3 py-2 text-left">Event</th>
                  <th className="px-3 py-2 text-left">Browser</th>
                  <th className="px-3 py-2 text-left">Device</th>
                  <th className="px-3 py-2 text-left">IP</th>
                  <th className="px-3 py-2 text-left">UA</th>
                </tr>
              </thead>
              <tbody>
                {activityLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : !activityLogs || activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-mute">
                      No activity entries match your filters.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((l: any) => (
                    <tr key={l._id} className="border-t border-line text-[13px]">
                      <td className="whitespace-nowrap px-3 py-2 text-mute">{formatDateTime(l.ts)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{l.email ?? l.userId?.slice(-6) ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-xs">{l.event}</span>
                      </td>
                      <td className="px-3 py-2">{l.browser ?? '—'}</td>
                      <td className="px-3 py-2">{l.device ?? '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{l.ip ?? '—'}</td>
                      <td className="max-w-[240px] truncate px-3 py-2 text-xs text-mute" title={l.userAgent}>
                        {l.userAgent ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line bg-line-soft/50 px-3 py-2 text-[11px] text-mute">
            Honest capture note: <code>userAgent</code>/<code>screenInfo</code> come from the browser (<code>navigator.userAgent</code>); they are
            trivially spoofable. <code>ip</code> is only populated when logging via an HTTP action that has a request object (e.g.{' '}
            <code>x-forwarded-for</code>); direct <code>activityLogs.log</code> mutation calls have no server IP.
          </div>
        </Card>
      )}
    </div>
  )
}
