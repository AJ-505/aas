import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Loader } from '~/components/Loader'
import { useCurrentUser } from '~/lib/auth'
import { auditQueries, userQueries, rateLimitQueries, useSetRateLimitEnabledMutation } from '~/lib/queries'
import { formatDateTime } from '~/lib/format'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/admin/audit')({
  component: AuditPage,
})

function AuditPage() {
  const { data: user } = useCurrentUser()
  const [tab, setTab] = useState<'audit' | 'activity' | 'throttle'>('audit')
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
  const throttleQ: any = rateLimitQueries.events(50)
  const statusQ: any = rateLimitQueries.status()
  const { data: throttleEventsAny, isLoading: throttleLoading } = useQuery({ ...throttleQ, enabled: tab === 'throttle' })
  const throttleEvents = throttleEventsAny as any
  const { data: rateStatusAny } = useQuery(statusQ)
  const rateStatus = rateStatusAny as any
  const setEnabled = useSetRateLimitEnabledMutation()

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

      <div className="flex gap-2 flex-wrap">
        <Button variant={tab === 'audit' ? 'default' : 'outline'} onClick={() => setTab('audit')}>
          Business audit ({auditLogs?.length ?? '—'})
        </Button>
        <Button variant={tab === 'activity' ? 'default' : 'outline'} onClick={() => setTab('activity')}>
          Activity ({activityLogs?.length ?? '—'})
        </Button>
        <Button variant={tab === 'throttle' ? 'default' : 'outline'} onClick={() => setTab('throttle')}>
          Throttle ({throttleEvents?.length ?? '—'})
        </Button>
        <span className="ml-auto flex items-center gap-2 text-xs">
          <span className={rateStatus?.enabled ? 'text-emerald-600' : 'text-red-600'}>
            Throttling: {rateStatus?.enabled ? 'ON' : 'OFF'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next = !rateStatus?.enabled
              setEnabled.mutate(
                { enabled: next } as any,
                {
                  onSuccess: () => toast.success(`Throttling ${next ? 'enabled' : 'disabled'}`),
                  onError: (e: any) => toast.error(e?.data?.message ?? e.message),
                },
              )
            }}
            disabled={setEnabled.isPending}
          >
            {rateStatus?.enabled ? 'Disable' : 'Enable'} (admin kill-switch)
          </Button>
        </span>
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
      ) : tab === 'activity' ? (
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
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-line-soft text-xs text-mute">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Class</th>
                  <th className="px-3 py-2 text-left">Limit</th>
                  <th className="px-3 py-2 text-left">Retry after</th>
                  <th className="px-3 py-2 text-left">Key</th>
                </tr>
              </thead>
              <tbody>
                {throttleLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : !throttleEvents || throttleEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-mute">
                      No throttle hits yet — limits are generous (admin 5/min, financial 20/min, bulk 5/min, standard 60/min). Events appear here when <code>RATE_LIMITED</code> fires; also logged to audit with <code>rateLimit.hit:*</code>.
                    </td>
                  </tr>
                ) : (
                  throttleEvents.map((e: any) => (
                    <tr key={e._id} className="border-t border-line text-[13px]">
                      <td className="whitespace-nowrap px-3 py-2 text-mute">{formatDateTime(e.ts)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{(e.userId as string)?.slice(-6) ?? '—'}</td>
                      <td className="px-3 py-2"><span className="rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 font-mono text-xs">{e.actionClass}</span></td>
                      <td className="px-3 py-2 font-mono text-xs">{e.limit}/{e.windowMs / 1000}s</td>
                      <td className="px-3 py-2 text-xs">{Math.ceil((e.retryAfterMs ?? 0) / 1000)}s</td>
                      <td className="max-w-[220px] truncate px-3 py-2 font-mono text-xs" title={e.key}>{e.key}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line bg-line-soft/50 px-3 py-2 text-[11px] text-mute">
            Limits — <code>admin</code> 5/min (setRole/setActive/bootstrap), <code>financial</code> 20/min (payments/invoices/sales),{' '}
            <code>bulk</code> 5/min (CSV import), <code>standard</code> 60/min (CRUD). Dedup on <code>payments.record</code> blocks identical{' '}
            <code>invoice+amount+method</code> within 60s (code <code>DEDUP</code>). Auth HTTP (sign-in/reset) honesty: Convex Auth runs as HTTP routes — no request IP in mutations; limit is per-user after auth. Client debounces login submit.
          </div>
        </Card>
      )}
    </div>
  )
}
