import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '~/components/ui/button'
import {
  IconCar,
  IconUsers,
  IconWrench,
  IconBanknote,
  IconTrendingUp,
  IconCheck,
  IconZap,
  IconBox,
  IconClock,
} from '~/components/icons'

export const Route = createFileRoute('/landing/5')({
  component: LandingFive,
})

const stats = [
  { value: '400+', label: 'Workshops' },
  { value: '15,000+', label: 'Vehicles serviced' },
  { value: 'NGN 2B+', label: 'Transactions processed' },
  { value: '98%', label: 'Customer retention' },
]

const features = [
  {
    icon: IconWrench,
    stat: '12 hrs',
    statLabel: 'saved per week',
    title: 'Streamlined operations',
    desc: 'Automate check-ins, job assignments, and customer notifications to cut admin time.',
  },
  {
    icon: IconTrendingUp,
    stat: '22%',
    statLabel: 'revenue increase',
    title: 'Data-driven decisions',
    desc: 'See real-time reports on workshop performance, technician productivity, and revenue trends.',
  },
  {
    icon: IconUsers,
    stat: '3x',
    statLabel: 'faster follow-ups',
    title: 'Customer retention',
    desc: 'Automated service reminders and history tracking keep customers coming back.',
  },
  {
    icon: IconBox,
    stat: '99.9%',
    statLabel: 'uptime',
    title: 'Reliable infrastructure',
    desc: 'Cloud-based platform with Nigerian data hosting. Access your dashboard from anywhere.',
  },
]

function LandingFive() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">Cedric Masters</span>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link to="/auth/login" className={buttonVariants({ size: 'sm' })}>
            Start free trial
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-1.5 text-[12px] font-semibold text-accent">
              <IconZap size={13} />
              Trusted by 400+ workshops across Nigeria
            </div>
            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.1] tracking-tight text-ink">
              The operating system
              <br />
              for auto workshops.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              Cedric Masters Autos helps workshops and dealerships manage jobs, inventory, customers, and sales
              in one place. Less paperwork, more productivity.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
                Start free trial
              </Link>
              <Link to="/auth/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Talk to sales
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_8px_24px_rgba(15,18,34,0.04)]"
              >
                <div className="text-[30px] font-extrabold tracking-tight text-ink">{s.value}</div>
                <div className="mt-1 text-[13px] text-mute">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line-soft bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[26px] font-extrabold tracking-tight text-ink">
            Measurable results, real impact
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[14px] text-body">
            Workshops using Cedric Masters Autos see significant improvements in efficiency and revenue.
          </p>
          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-line-soft bg-bg p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,0.08)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)]">
                    <Icon size={18} />
                  </span>
                  <div className="mt-4">
                    <span className="text-[24px] font-extrabold tracking-tight text-ink">{f.stat}</span>
                    <span className="ml-1 text-[12px] font-semibold text-accent">{f.statLabel}</span>
                  </div>
                  <h3 className="mt-1.5 text-[14px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-body">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] px-8 py-14 text-center text-white">
            <h2 className="text-[28px] font-extrabold tracking-tight">
              Ready to transform your workshop?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] text-indigo-200">
              Join 400+ Nigerian auto businesses already using Cedric Masters Autos.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/auth/login"
                className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-5 text-[13px] font-semibold text-accent-deep shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all hover:bg-white/90"
              >
                Start free trial
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] border border-indigo-300/40 px-5 text-[13px] font-semibold text-white/90 transition-all hover:bg-white/10"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft bg-surface py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
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
