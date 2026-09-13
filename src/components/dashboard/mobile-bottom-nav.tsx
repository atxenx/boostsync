'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, Plus, ShoppingCart, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dictionary } from '@/lib/i18n/dictionaries'

export function MobileBottomNav({ dict }: { dict: Dictionary }) {
  const pathname = usePathname()
  const labels = dict.dashboard.sidebar
  const links = [
    { href: '/dashboard', label: labels.overview, icon: LayoutDashboard, active: pathname === '/dashboard' },
    { href: '/dashboard/services', label: labels.services, icon: ShoppingCart, active: pathname.startsWith('/dashboard/services') },
    { href: '/dashboard/orders/new', label: labels.newOrder, icon: Plus, active: pathname === '/dashboard/orders/new', primary: true },
    { href: '/dashboard/orders', label: labels.orders, icon: ListOrdered, active: pathname === '/dashboard/orders' },
    { href: '/dashboard/wallet', label: labels.addFunds, icon: Wallet, active: pathname.startsWith('/dashboard/wallet') || pathname.startsWith('/dashboard/transactions') },
  ]

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 h-[calc(4.75rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex h-[4.75rem] max-w-md items-end">
        {links.map(({ href, label, icon: Icon, active, primary }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 rounded-xl pb-2 text-[11px] font-medium leading-none transition-colors',
              primary ? 'relative -top-5 text-slate-700' : active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700',
            )}
          >
            <span className={cn(
              'flex size-9 items-center justify-center rounded-xl transition-colors',
              primary ? 'size-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30' : active && 'bg-blue-50',
            )}>
              <Icon className={primary ? 'size-5' : 'size-[18px]'} strokeWidth={active || primary ? 2.4 : 2} />
            </span>
            <span className={cn('w-full truncate px-0.5 text-center whitespace-nowrap', primary && 'mt-1')}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
