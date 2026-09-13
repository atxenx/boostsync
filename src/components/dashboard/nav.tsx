import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ShoppingCart, ListOrdered, Wallet, ShieldAlert, LogOut } from 'lucide-react'

export async function DashboardNav() {
  const session = await auth()
  
  let balance = 0
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true }
    })
    if (user) balance = user.balance
  }
  
  return (
    <nav className="flex flex-col w-64 border-r min-h-screen p-4 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">SMM Panel</h1>
        <p className="text-sm text-slate-500 mt-2">Welcome, {session?.user?.name}</p>
        <div className="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
          Balance: ฿{balance.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-2 flex-1">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/dashboard/services" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100">
          <ShoppingCart className="h-4 w-4" />
          New Order
        </Link>
        <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100">
          <ListOrdered className="h-4 w-4" />
          Order History
        </Link>
        <Link href="/dashboard/wallet" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100">
          <Wallet className="h-4 w-4" />
          Add Funds
        </Link>

        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-600 font-medium hover:bg-blue-50 mt-4 border border-blue-200">
            <ShieldAlert className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </div>

      <div className="mt-auto pt-4 border-t">
        <form action={async () => {
          'use server'
          await signOut({ redirectTo: '/login' })
        }}>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600" type="submit">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </nav>
  )
}
