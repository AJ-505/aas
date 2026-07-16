import { Link, createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { buttonVariants } from '~/components/ui/button'
import { useCurrentUser } from '~/lib/auth'
import { ROLE_LABELS } from '~/lib/enums'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const { data: user } = useCurrentUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-sm text-slate-500">
          {user?.role ? ROLE_LABELS[user.role] : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>After-Sales Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Manage customers, vehicles, and workshop jobs.
            </p>
            <Link to="/service/customers" className={`${buttonVariants({ className: 'mt-4' })} text-slate-50`}>
              Open customers
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Inventory, leads, sales orders, and deliveries.
            </p>
            <span className={`${buttonVariants({ variant: 'secondary', className: 'mt-4' })} opacity-60`}>
              Coming in Phase 4
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Manage users and assign roles.</p>
            {user?.role === 'admin' ? (
              <Link to="/admin/users" className={`${buttonVariants({ className: 'mt-4' })} text-slate-50`}>
                Manage users
              </Link>
            ) : (
              <span className={`${buttonVariants({ variant: 'secondary', className: 'mt-4' })} opacity-60`}>
                Admin only
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
