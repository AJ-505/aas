import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useRouter, useRouterState } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Loader } from '~/components/Loader'
import { Avatar } from '~/components/Avatar'
import {
  IconBanknote,
  IconBell,
  IconBox,
  IconChevronRight,
  IconGrid,
  IconLogOut,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSliders,
  IconSun,
  IconUsers,
  IconWrench,
} from '~/components/icons'
import { useCurrentUser } from '~/lib/auth'
import { jobQueries, userQueries, useBootstrapFirstAdminMutation } from '~/lib/queries'
import { ROLES, ROLE_LABELS, type Role } from '~/lib/enums'
import { cn } from '~/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: typeof IconGrid
  roles: Role[]
  match: string[]
}

const ALL_STAFF: Role[] = [...ROLES]

const NAV_GENERAL: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: IconGrid, roles: ALL_STAFF, match: ['/'] },
  { label: 'Customers', to: '/service/customers', icon: IconUsers, roles: ALL_STAFF, match: ['/service/customer'] },
  { label: 'Jobs', to: '/service/jobs', icon: IconWrench, roles: ALL_STAFF, match: ['/service/job', '/service/checkin'] },
]

const NAV_OPS: NavItem[] = [
  { label: 'Parts', to: '/service/parts', icon: IconBox, roles: ['inventoryManager', 'manager', 'admin'], match: ['/service/parts'] },
  { label: 'Finance', to: '/service/finance', icon: IconBanknote, roles: ['finance', 'manager', 'admin'], match: ['/service/finance'] },
  { label: 'User Management', to: '/admin/users', icon: IconSliders, roles: ['admin'], match: ['/admin/users'] },
]

function canSee(item: NavItem, role: Role | null): boolean {
  if (!role) return false
  if (role === 'admin') return true
  return item.roles.includes(role)
}

function isActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/') return pathname === '/'
  return item.match.some((m) => pathname.startsWith(m))
}

function breadcrumb(pathname: string): string[] {
  if (pathname === '/') return ['Workshop', 'Dashboard']
  if (pathname.startsWith('/service/customers')) return ['Workshop', 'Customers']
  if (pathname.startsWith('/service/customer/')) return ['Workshop', 'Customers', 'Profile']
  if (pathname.startsWith('/service/jobs')) return ['Workshop', 'Jobs']
  if (pathname.startsWith('/service/job/')) return ['Workshop', 'Jobs', `#${pathname.split('/').pop()?.slice(-6)}`]
  if (pathname.startsWith('/service/checkin')) return ['Workshop', 'Jobs', 'Check in']
  if (pathname.startsWith('/service/finance')) return ['Operations', 'Finance']
  if (pathname.startsWith('/service/parts')) return ['Operations', 'Parts Catalogue']
  if (pathname.startsWith('/admin/users')) return ['Operations', 'User Management']
  return ['Workshop']
}

export function AppShell({ children }: { children: ReactNode }) {
  // Auth gating uses the lightweight auth-provider state (single roundtrip) so
  // redirects for guests happen fast; the full user record loads in parallel.
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const router = useRouter()
  const queryClient = useQueryClient()
  const { signOut } = useAuthActions()
  const searchRef = useRef<HTMLInputElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  )
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  const isLogin = pathname === '/auth/login'
  const { data: openJobsCount } = useQuery({
    ...jobQueries.openCount(),
    enabled: !!user?.role && !isLogin,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('theme')
    const nextTheme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    setTheme(nextTheme)
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    window.localStorage.setItem('theme', nextTheme)
    setTheme(nextTheme)
  }

  if (isLogin) {
    if (isAuthenticated) {
      return <Navigate to="/" />
    }
    return (
      <div className="relative flex h-full items-center justify-center overflow-auto bg-bg p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(600px_260px_at_50%_0%,rgba(79,70,229,0.10),transparent)]" />
        <div className="relative flex w-full max-w-sm flex-col items-center">
          <div className="mb-5 flex flex-col items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-accent to-violet-600 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(79,70,229,0.4)]">
              CM
            </span>
            <div className="text-center">
              <div className="text-lg font-extrabold tracking-tight text-ink">Cedric Masters</div>
              <div className="text-xs text-mute">Autos Management</div>
            </div>
          </div>
          {children}
        </div>
      </div>
    )
  }

  if (authLoading || (isAuthenticated && userLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" />
  }

  if (!user.role) {
    return <PendingRoleAssignment userId={user!._id} userName={user!.name} />
  }

  const role = user!.role
  const crumbs = breadcrumb(pathname)

  return (
    <div className="flex h-full min-h-0">
      {/* ── sidebar ─────────────────────────────── */}
      <aside
        className={cn(
          'sticky top-0 h-screen w-[250px] shrink-0 flex-col border-r border-line bg-surface',
          sidebarOpen ? 'fixed inset-y-0 left-0 z-30 flex md:sticky' : 'hidden',
        )}
      >
        <div className="flex items-center gap-2.5 px-[18px] pb-4 pt-[18px]">
          <span className="grid size-[34px] place-items-center rounded-[10px] bg-gradient-to-br from-indigo-500 via-accent to-violet-600 text-xs font-extrabold text-white shadow-[0_4px_12px_rgba(79,70,229,0.35)]">
            CM
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-ink">Cedric Masters</span>
            <span className="block text-[11px] text-mute">Autos Management</span>
          </span>
        </div>

        <nav className="flex-1 overflow-auto px-3 pb-3">
          <NavSection
          label="General"
          items={NAV_GENERAL}
          role={role}
          pathname={pathname}
          openJobsCount={openJobsCount}
          />
          <NavSection
          label="Operations"
          items={NAV_OPS}
          role={role}
          pathname={pathname}
          openJobsCount={openJobsCount}
          />
        </nav>

        <div className="m-3 flex items-center gap-2.5 rounded-xl border border-line p-2.5">
          <Avatar name={user!.name ?? user!.email ?? '?'} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink">
              {user!.name ?? user!.email}
            </span>
            <span className="block text-[11.5px] text-mute">{ROLE_LABELS[role]}</span>
          </span>
          <button
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 place-items-center rounded-lg text-mute transition-colors hover:bg-bg hover:text-rose-600"
            onClick={async () => {
              await signOut()
              await queryClient.invalidateQueries()
              void router.navigate({ to: '/auth/login' })
            }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── main column ─────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/80 px-7 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              className="grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body hover:bg-accent-soft"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <IconMenu size={17} />
            </button>
            <div className="flex items-center gap-1.5 text-[13px] text-mute">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <IconChevronRight size={13} />}
                <span className={i === crumbs.length - 1 ? 'font-semibold text-ink' : ''}>{c}</span>
              </span>
            ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-[9px] bg-line-soft px-3 py-[7px] text-mute transition-colors focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/25 sm:flex sm:w-[280px]">
              <IconSearch size={15} />
              <input
                ref={searchRef}
                placeholder="Search jobs, plates, customers…"
                className="w-full border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-mute"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void router.navigate({ to: '/service/customers' })
                }}
              />
              <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10.5px] text-mute">⌘K</kbd>
            </div>
            <button
              aria-label="Notifications"
              className="relative grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body transition-colors hover:bg-accent-soft"
            >
              <IconBell size={17} />
              <span className="absolute right-2 top-2 size-[7px] rounded-full border-[1.5px] border-white bg-rose-500" />
            </button>
            <button
              type="button"
              aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
              className="grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body hover:bg-accent-soft"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <Avatar name={user!.name ?? user!.email ?? '?'} size={32} />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1280px] px-7 pb-16 pt-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

function NavSection({
  label,
  items,
  role,
  pathname,
  openJobsCount,
}: {
  label: string
  items: NavItem[]
  role: Role
  pathname: string
  openJobsCount?: number
}) {
  const visible = items.filter((i) => canSee(i, role))
  if (visible.length === 0) return null
  return (
    <div>
      <div className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-mute">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={isActive(item, pathname)}
            openJobsCount={openJobsCount}
          />
        ))}
      </div>
    </div>
  )
}

function NavLink({
  item,
  active,
  openJobsCount,
}: {
  item: NavItem
  active: boolean
  openJobsCount?: number
}) {
  const openJobs = item.label === 'Jobs' ? openJobsCount : undefined

  return (
    <Link
      to={item.to}
      className={cn(
        'flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] font-medium text-body transition-colors hover:bg-bg hover:text-ink',
        active && 'bg-accent-soft font-semibold text-accent-deep hover:bg-accent-soft hover:text-accent-deep',
      )}
    >
      <item.icon size={17} />
      <span className="flex-1">{item.label}</span>
      {openJobs != null && openJobs > 0 && (
        <span
          className={cn(
            'rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600',
            active && 'bg-accent-soft text-accent-deep',
          )}
        >
          {openJobs}
        </span>
      )}
    </Link>
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
    <div className="flex h-full items-center justify-center bg-bg p-8">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-bold text-ink">Welcome{userName ? `, ${userName}` : ''}</h1>
          <p className="text-[13px] text-mute">
            Your account has not been assigned a role yet. Please contact an
            administrator to get access.
          </p>
          {adminExists === false && (
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-left">
              <p className="text-[13px] font-semibold text-amber-800">
                No administrator has been set up yet.
              </p>
              <p className="mt-1 text-[13px] text-amber-700">
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
        </CardContent>
      </Card>
    </div>
  )
}
