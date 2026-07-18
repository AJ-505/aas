import type { SelectHTMLAttributes } from 'react'
import { cn } from '~/lib/utils'
import { IconChevronDown } from '~/components/icons'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        className="h-9 w-full appearance-none rounded-[9px] border border-line bg-surface pl-3 pr-8 text-[13px] font-medium text-ink transition-colors focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mute"
      />
    </div>
  )
}
