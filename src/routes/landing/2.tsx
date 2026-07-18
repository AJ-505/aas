import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '~/components/ui/button'
import {
  IconCar,
  IconUsers,
  IconSearch,
  IconCheck,
  IconCalendar,
  IconWrench,
  IconZap,
  IconTrendingUp,
} from '~/components/icons'

export const Route = createFileRoute('/landing/2')({
  component: LandingTwo,
})

const features = [
  { icon: IconZap, title: 'Real-time job tracking', desc: 'Know the status of every vehicle in your shop at a glance.' },
  { icon: IconUsers, title: 'Customer profiles', desc: 'Service history, vehicle details, and contact logs in one place.' },
  { icon: IconCalendar, title: 'Appointment scheduling', desc: 'Let customers book service slots online. No more phone tag.' },
  { icon: IconTrendingUp, title: 'Sales & inventory', desc: 'Manage your showroom stock and track leads through to sale.' },
]

function LandingTwo() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
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

      <section className="mx-auto grid min-h-[calc(100vh-300px)] max-w-7xl grid-cols-1 items-center gap-12 px-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-1.5 text-[12px] font-semibold text-accent">
            <IconZap size={13} />
            End-to-end auto business platform
          </div>
          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.08] tracking-tight text-ink">
            One system for
            <br />
            service{' '}
            <span className="text-accent">and sales</span>.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-body">
            Cedric Masters Autos unifies your workshop operations and vehicle dealership into a single platform.
            Manage repairs, parts, customers, and showroom inventory without switching between tools.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
              Start free trial
            </Link>
            <Link to="/auth/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Book a demo
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-[13px] text-mute">
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} className="text-emerald-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} className="text-emerald-500" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} className="text-emerald-500" />
              Cancel anytime
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[32px] bg-accent/5 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { icon: IconWrench, value: '200+', label: 'Workshops onboarded' },
              { icon: IconCar, value: '15K+', label: 'Vehicles serviced' },
              { icon: IconUsers, value: '98%', label: 'Customer retention' },
              { icon: IconTrendingUp, value: 'NGN 2B+', label: 'Transactions processed' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(15,18,34,0.04)]"
              >
                <stat.icon size={20} className="text-accent" />
                <div className="mt-3 text-[26px] font-extrabold tracking-tight text-ink">{stat.value}</div>
                <div className="mt-0.5 text-[13px] text-mute">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line-soft bg-bg py-20">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="group">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <Icon size={17} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-body">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft bg-surface py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-8">
          <span className="text-[13px] font-semibold text-mute">
            &copy; 2026 Cedric Masters Autos. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-[12px] text-mute">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
