import type { ReactNode } from 'react'
import { Link, Navigate, useRouter, useRouterState } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { useCurrentUser } from '~/lib/auth'
import { userQueries, useBootstrapFirstAdminMutation } from '~/lib/queries'
import { ROLES, ROLE_LABELS, type Role } from '~/lib/enums'
import { cn } from '~/lib/utils'
interface NavItem {
  label: string
  to: string
  roles: Role[]
}

const ALL_STAFF: Role[] = [...ROLES]

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', roles: ALL_STAFF },
  { label: 'Customers', to: '/service/customers', roles: ALL_STAFF },
  { label: 'User Management', to: '/admin/users', roles: ['admin'] },
]

function canSee(item: NavItem, role: Role | null): boolean {
  if (!role) return false
  if (role === 'admin') return true
  return item.roles.includes(role)
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const router = useRouter()
  const queryClient = useQueryClient()
  const { signOut } = useAuthActions()

  const isLogin = pathname === '/auth/login'

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!user && !isLogin) {
    return <Navigate to="/auth/login" />
  }

  if (!user && isLogin) {
    return <div className="flex h-full items-center justify-center p-8">{children}</div>
  }

  // user is signed in
  if (isLogin) {
    return <Navigate to="/" />
  }

  if (!user.role) {
    return <PendingRoleAssignment userId={user._id} userName={user.name} />
  }

  const visibleNav = NAV_ITEMS.filter((item) => canSee(item, user.role))

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="text-lg font-black">Cedric Masters</div>
          <div className="text-xs text-slate-500">Autos Management</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100',
                pathname === item.to && 'bg-slate-900 text-slate-50 hover:bg-slate-900',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {user.name ?? user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut()
                await queryClient.invalidateQueries()
                void router.navigate({ to: '/auth/login' })
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

function PendingRoleAssignment({
  userName,
}: {
  userId: string
  userName: string | null
}) {
  const queryClient = useQueryClient()
  const { data: adminExists } = useQuery(userQueries.adminExists())
  const bootstrap = useBootstrapFirstAdminMutation()

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-xl font-semibold">Welcome{userName ? `, ${userName}` : ''}</h1>
        <p className="text-sm text-slate-500">
          Your account has not been assigned a role yet. Please contact an
          administrator to get access.
        </p>
        {adminExists === false && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-sm font-medium text-amber-800">
              No administrator has been set up yet.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              If you are the first team member, you can claim the admin role to
              get started.
            </p>
            <Button
              className="mt-3"
              onClick={() =>
                bootstrap.mutate(undefined, {
                  onSuccess: () => {
                    toast.success('You are now an administrator.')
                    void queryClient.invalidateQueries()
                  },
                })
              }
              disabled={bootstrap.isPending}
            >
              {bootstrap.isPending ? 'Claiming...' : 'Claim admin role'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
