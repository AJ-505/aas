import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '~/components/ui/button'
import {
  IconCar,
  IconUsers,
  IconWrench,
  IconBanknote,
  IconZap,
  IconCheck,
  IconTrendingUp,
} from '~/components/icons'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/landing/1')({
  component: LandingOne,
})

const features = [
  {
    icon: IconWrench,
    title: 'Workshop management',
    desc: 'Track jobs from check-in to completion with real-time status updates and technician assignment.',
  },
  {
    icon: IconCar,
    title: 'Inventory & parts',
    desc: 'Manage stock, track usage, and automate reordering so your shop never runs dry.',
  },
  {
    icon: IconUsers,
    title: 'Customer CRM',
    desc: 'Keep a complete service history for every customer with vehicle profiles and communication logs.',
  },
  {
    icon: IconBanknote,
    title: 'Finance & invoicing',
    desc: 'Generate estimates, invoices, and receipts. Track payments and outstanding balances in real time.',
  },
]

function LandingOne() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">Cedric Masters</span>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link to="/auth/login" className={buttonVariants({ size: 'sm' })}>
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface px-4 py-1.5 text-[12px] font-semibold text-mute shadow-xs">
          <IconZap size={13} className="text-accent" />
          Built for Nigerian auto workshops and dealerships
        </div>
        <h1 className="mt-8 text-[42px] font-extrabold leading-[1.1] tracking-tight text-ink">
          Workshop management
          <br />
          that keeps your shop moving.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-body">
          From check-in to checkout, Cedric Masters Autos gives you one platform to manage service jobs,
          customer relationships, parts inventory, and vehicle sales. No spreadsheets, no missed follow-ups.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
            Start free trial
          </Link>
          <Link
            to="/auth/login"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            View demo
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_12px_40px_rgba(15,18,34,0.06)]">
          <div className="flex items-center gap-1.5 border-b border-line-soft bg-bg px-5 py-3">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-[11px] font-semibold text-mute">Dashboard preview</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Open jobs', value: '12', trend: '+3 today' },
                { label: 'In progress', value: '08', trend: '4 technicians' },
                { label: 'Ready for pickup', value: '05', trend: 'Awaiting collection' },
                { label: 'Revenue this month', value: 'NGN 4.8M', trend: '+22% vs last month' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-line-soft bg-surface p-4">
                  <div className="text-[11px] font-semibold text-mute">{stat.label}</div>
                  <div className="mt-1 text-[18px] font-extrabold tracking-tight text-ink">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-emerald-600">{stat.trend}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="rounded-xl border border-line-soft">
                <div className="flex items-center gap-6 border-b border-line-soft px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-mute">
                  <span className="w-24">Status</span>
                  <span className="flex-1">Vehicle</span>
                  <span className="flex-1">Customer</span>
                  <span className="hidden w-28 lg:block">Checked in</span>
                </div>
                {[
                  { status: 'In progress', vehicle: 'Toyota Camry', customer: 'Emeka Okafor', time: '09:15 AM' },
                  { status: 'Waiting parts', vehicle: 'Honda Accord', customer: 'Chioma Nwachukwu', time: '10:30 AM' },
                  { status: 'Ready', vehicle: 'Mercedes C300', customer: 'Tunde Balogun', time: '11:00 AM' },
                ].map((row) => (
                  <div
                    key={row.vehicle}
                    className="flex items-center gap-6 border-b border-line-soft px-4 py-3 last:border-0 text-[13px]"
                  >
                    <span className="w-24 font-semibold text-ink">{row.status}</span>
                    <span className="flex-1 text-body">{row.vehicle}</span>
                    <span className="flex-1 text-body">{row.customer}</span>
                    <span className="hidden w-28 text-mute lg:block">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line-soft bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[26px] font-extrabold tracking-tight text-ink">
            Everything you need to run your workshop
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[14px] text-body">
            One platform covering service, sales, inventory, and customer management.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-xl border border-line-soft bg-bg p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,18,34,0.06)]">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-body">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft bg-bg py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <span className="text-[13px] font-semibold text-mute">
            &copy; 2026 Cedric Masters Autos. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-[12px] text-mute">
            <span>Privacy policy</span>
            <span>Terms of service</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
