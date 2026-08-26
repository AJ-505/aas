import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Select } from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import {
  userQueries,
  useSetRoleMutation,
  useSetActiveMutation,
  useAdminResetPasswordMutation,
  useAdminReset2FAMutation,
} from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'
import { ROLES, ROLE_LABELS, type Role } from '~/lib/enums'
import { useState } from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

import { useCurrentUser } from '~/lib/auth'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  const { data: user } = useCurrentUser()
  const { data: users, isLoading } = useQuery(userQueries.list())

  if (user?.role && user.role !== 'admin') {
    return <Navigate to="/" />
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[23px] font-extrabold tracking-tight text-ink">User management</h1>
        <p className="mt-1 text-[13px] text-mute">
          Assign roles and activate or deactivate team members.
        </p>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-mute">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <UserRow key={u._id} user={u} />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function UserRow({
  user,
}: {
  user: {
    _id: string
    name: string | null
    email: string | null
    phone: string | null
    role: Role | null
    active: boolean
    totpEnabled?: boolean
    mustChangePassword?: boolean
  }
}) {
  const queryClient = useQueryClient()
  const setRole = useSetRoleMutation()
  const setActive = useSetActiveMutation()
  const resetPw = useAdminResetPasswordMutation()
  const reset2FA = useAdminReset2FAMutation()
  const [tempPw, setTempPw] = useState("")
  const [showPw, setShowPw] = useState(false)

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <span className="flex items-center gap-2.5">
          <Avatar name={user.name ?? user.email ?? '?'} size={28} />
          <span>
            <span className="block font-semibold text-ink">{user.name ?? '-'}</span>
            <span className="block text-[11px] text-mute md:hidden">{user.email ?? ''}</span>
          </span>
        </span>
      </TableCell>
      <TableCell className="hidden text-body md:table-cell">{user.email ?? '-'}</TableCell>
      <TableCell className="hidden text-body lg:table-cell">{user.phone ?? '-'}</TableCell>
      <TableCell>
        <Select
          className="w-44"
          value={user.role ?? ''}
          onChange={(e) => {
            const role = e.target.value as Role
            setRole.mutate(
              { userId: user._id as Id<'users'>, role },
              {
                onSuccess: () => {
                  toast.success('Role updated.')
                  void queryClient.invalidateQueries()
                },
              },
            )
          }}
        >
          <option value="" disabled>
            Unassigned
          </option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </TableCell>
      <TableCell>
        <Badge dot variant={user.active ? 'success' : 'destructive'}>
          {user.active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setActive.mutate(
                { userId: user._id as Id<'users'>, active: !user.active },
                {
                  onSuccess: () => {
                    toast.success(user.active ? 'User deactivated.' : 'User activated.')
                    void queryClient.invalidateQueries()
                  },
                },
              )
            }
          >
            {user.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPw((v) => !v)}
            title="Set temporary password and force change"
          >
            Reset PW
          </Button>
          {user.totpEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!confirm(`Reset 2FA for ${user.email ?? user.name}?`)) return
                reset2FA.mutate({ userId: user._id as Id<'users'> } as any, {
                  onSuccess: () => { toast.success("2FA reset"); void queryClient.invalidateQueries() },
                  onError: (e: any) => toast.error(e?.data ?? e?.message ?? "Failed"),
                })
              }}
              disabled={reset2FA.isPending}
            >
              Reset 2FA
            </Button>
          )}
          {showPw && (
            <div className="rounded-lg border border-line p-2 space-y-2 bg-bg">
              <Label className="text-xs">Temp password (≥8 chars)</Label>
              <Input value={tempPw} onChange={(e) => setTempPw(e.target.value)} placeholder="Temp1234!" className="h-8" />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  disabled={resetPw.isPending}
                  onClick={() => {
                    const pw = tempPw.trim() || `Tmp${Math.random().toString(36).slice(2, 10)}!A1`
                    if (pw.length < 8) { toast.error("At least 8 chars"); return }
                    resetPw.mutate({ userId: user._id as Id<'users'>, tempPassword: pw } as any, {
                      onSuccess: () => { toast.success(`Password reset. Temp: ${pw}`); setTempPw(""); setShowPw(false); void queryClient.invalidateQueries() },
                      onError: (e: any) => toast.error(e?.data ?? e?.message ?? "Failed"),
                    })
                  }}
                >
                  Set
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPw(false)}>Cancel</Button>
              </div>
              {user.mustChangePassword && <span className="text-xs text-amber-700">Must change on next login</span>}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
