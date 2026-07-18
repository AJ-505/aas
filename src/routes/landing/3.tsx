import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '~/components/ui/button'
import {
  IconCar,
  IconUsers,
  IconWrench,
  IconBanknote,
  IconBox,
  IconPhone,
  IconCalendar,
  IconCheck,
} from '~/components/icons'

export const Route = createFileRoute('/landing/3')({
  component: LandingThree,
})

const features = [
  {
    icon: IconWrench,
    title: 'Job management',
    desc: 'Create, assign, and track repair jobs from check-in to checkout with full audit trails.',
  },
  {
    icon: IconCar,
    title: 'Vehicle profiles',
    desc: 'Store service history, plate numbers, VINs, and photos for every vehicle that comes through.',
  },
  {
    icon: IconUsers,
    title: 'Customer management',
    desc: 'Build rich customer profiles with contact info, preferences, and full communication history.',
  },
  {
    icon: IconBox,
    title: 'Parts inventory',
    desc: 'Track stock levels, manage suppliers, and get alerts when parts run low.',
  },
  {
    icon: IconBanknote,
    title: 'Estimates & invoices',
    desc: 'Generate professional quotes and invoices. Accept partial payments and track balances.',
  },
  {
    icon: IconCalendar,
    title: 'Appointments',
    desc: 'Let customers book service appointments online with automated reminders via SMS.',
  },
]

function LandingThree() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-[17px] font-extrabold tracking-tight text-white">Cedric Masters</span>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className="text-[13px] font-semibold text-white/80 transition-colors hover:text-white">
            Sign in
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-3.5 text-[13px] font-semibold text-accent-deep shadow-sm transition-all hover:bg-white/90"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative -mt-[73px] bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] px-6 pt-28 pb-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-[44px] font-extrabold leading-[1.08] tracking-tight text-white">
            Run your workshop like a well-oiled machine.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-indigo-200">
            Cedric Masters Autos gives you everything you need to manage service jobs, customers, parts, and sales
            from a single dashboard. Built specifically for the Nigerian auto industry.
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
              Talk to sales
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-5 text-[13px] text-indigo-200">
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} />
              14-day trial
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck size={14} />
              Nigerian support team
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(15,18,34,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,0.10)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)]">
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-body">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-line-soft bg-surface py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-[22px] font-extrabold tracking-tight text-ink">
            Used by workshops across Nigeria
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: 'Active users', value: '400+' },
              { label: 'Vehicles tracked', value: '15,000+' },
              { label: 'Monthly transactions', value: 'NGN 2B+' },
              { label: 'Avg. time saved', value: '12 hrs/week' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[28px] font-extrabold tracking-tight text-ink">{s.value}</div>
                <div className="mt-0.5 text-[12px] font-medium text-mute">{s.label}</div>
              </div>
            ))}
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
