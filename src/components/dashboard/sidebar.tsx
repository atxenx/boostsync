'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ListOrdered, 
  Wallet, 
  ShieldAlert, 
  LogOut,
  CreditCard,
  PlusCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dictionary } from '@/lib/i18n/dictionaries'

interface SidebarProps {
  user: any;
  balance: number;
  dict?: Dictionary;
}

export function Sidebar({ user, balance, dict }: SidebarProps) {
  const pathname = usePathname()

  // Use dict if provided, otherwise fallback to english (for safety)
  const d = dict?.dashboard?.sidebar || {
    overview: 'Dashboard',
    newOrder: 'New Order',
    services: 'Services',
    orders: 'Orders',
    addFunds: 'Add Funds',
    transactions: 'Transactions',
    management: 'Management',
    finance: 'Finance',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
  };

  const mainLinks = [
    { href: '/dashboard', label: d.overview, icon: LayoutDashboard },
    { href: '/dashboard/orders/new', label: d.newOrder, icon: PlusCircle },
    { href: '/dashboard/services', label: d.services, icon: ShoppingCart },
    { href: '/dashboard/orders', label: d.orders, icon: ListOrdered },
  ]

  const financeLinks = [
    { href: '/dashboard/wallet', label: d.addFunds, icon: CreditCard },
    { href: '/dashboard/transactions', label: d.transactions, icon: Wallet },
  ]

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#0a1128] text-slate-300 md:flex">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
          <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            BoostSync
          </Link>
        </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        
        <div>
          <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{d.management}</h3>
          <div className="space-y-1">
            {mainLinks.map(link => {
              const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
              return (
                <Link key={link.href} href={link.href} 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    active ? "bg-blue-600/10 text-blue-400" : "hover:bg-slate-800/50 hover:text-white"
                  )}>
                  <link.icon className={cn("w-4 h-4", active ? "text-blue-400" : "text-slate-400")} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{d.finance}</h3>
          <div className="space-y-1">
            {financeLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href} 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    active ? "bg-blue-600/10 text-blue-400" : "hover:bg-slate-800/50 hover:text-white"
                  )}>
                  <link.icon className={cn("w-4 h-4", active ? "text-blue-400" : "text-slate-400")} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div>
            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin</h3>
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 hover:text-white transition-all text-blue-400">
              <ShieldAlert className="w-4 h-4" /> {d.adminPanel}
            </Link>
          </div>
        )}

      </div>

      <div className="p-4 border-t border-slate-800/50 bg-[#070c1e]">
        <div className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Wallet Balance</div>
          <div className="text-xl font-bold text-white mb-3">฿{balance.toFixed(2)}</div>
          <Link href="/dashboard/wallet" className="block w-full py-2 text-center text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
            + {d.addFunds}
          </Link>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 hover:text-white transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold uppercase group-hover:bg-blue-600 transition-colors">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-white">{user?.name}</div>
            <div className="text-xs text-slate-500">{d.logout}</div>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </button>
      </div>

    </aside>
  )
}
