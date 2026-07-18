import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '~/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent-soft text-accent-deep',
        secondary: 'bg-line-soft text-slate-600',
        outline: 'border border-line text-body',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        destructive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  )
}
