'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  ListOrdered, 
  ArrowLeft,
  Settings,
  Package,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileMenu } from '@/components/providers/mobile-menu-provider'

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useMobileMenu()

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ListOrdered },
    { href: '/admin/services', label: 'Services', icon: Package },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/providers', label: 'Providers', icon: Server },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
        />
      )}

      <aside className={cn(
        "w-64 bg-[#0a1128] flex flex-col h-screen fixed left-0 top-0 text-slate-300 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
          <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            AdminSync
          </Link>
          <button onClick={close} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        <div>
          <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Management</h3>
          <div className="space-y-1">
            {links.map(link => {
              const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
              return (
                <Link key={link.href} href={link.href} 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    active ? "bg-red-500/10 text-red-400" : "hover:bg-slate-800/50 hover:text-white"
                  )}>
                  <link.icon className={cn("w-4 h-4", active ? "text-red-400" : "text-slate-400")} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-[#070c1e]">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
          User Dashboard
        </Link>
      </div>
    </aside>
    </>
  )
}
