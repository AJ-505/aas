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
  }
}) {
  const queryClient = useQueryClient()
  const setRole = useSetRoleMutation()
  const setActive = useSetActiveMutation()

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <span className="flex items-center gap-2.5">
          <Avatar name={user.name ?? user.email ?? '?'} size={28} />
          <span>
            <span className="block font-semibold text-ink">{user.name ?? '—'}</span>
            <span className="block text-[11px] text-mute md:hidden">{user.email ?? ''}</span>
          </span>
        </span>
      </TableCell>
      <TableCell className="hidden text-body md:table-cell">{user.email ?? '—'}</TableCell>
      <TableCell className="hidden text-body lg:table-cell">{user.phone ?? '—'}</TableCell>
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
