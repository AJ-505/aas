import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader } from '~/components/Loader'
import {
  userQueries,
  useSetRoleMutation,
  useSetActiveMutation,
} from '~/lib/queries'
import type { Id } from 'convex/_generated/dataModel'
import { ROLES, ROLE_LABELS, type Role } from '~/lib/enums'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  const { data: users, isLoading } = useQuery(userQueries.list())

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-slate-500">
          Assign roles and activate or deactivate team members.
        </p>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
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
  }
}) {
  const queryClient = useQueryClient()
  const setRole = useSetRoleMutation()
  const setActive = useSetActiveMutation()

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name ?? '—'}</TableCell>
      <TableCell>{user.email ?? '—'}</TableCell>
      <TableCell>{user.phone ?? '—'}</TableCell>
      <TableCell>
        <select
          className="h-8 rounded-md border border-slate-300 px-2 text-sm"
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
        </select>
      </TableCell>
      <TableCell>
        <Badge variant={user.active ? 'success' : 'destructive'}>
          {user.active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  )
}
