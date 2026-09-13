import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Wallet, ShoppingCart, Activity, TrendingUp, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { dict } = await getDictionary()
  const userId = session.user.id

  const [user, orders, transactions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { balance: true, name: true }
    }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { service: true }
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ])

  if (!user) redirect('/login')

  const orderStats = await db.order.groupBy({
    by: ['status'],
    where: { userId },
    _count: { _all: true },
    _sum: { charge: true }
  })

  let totalOrders = 0
  let activeOrders = 0
  let totalSpent = 0

  orderStats.forEach(stat => {
    totalOrders += stat._count._all
    if (['PROCESSING', 'IN_PROGRESS', 'PENDING'].includes(stat.status)) activeOrders += stat._count._all
    if (!['REFUNDED', 'FAILED', 'CANCELED'].includes(stat.status)) {
      totalSpent += stat._sum.charge || 0
    }
  })

  // Get transactions from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentTxs = await db.transaction.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo }, type: 'ORDER_PAYMENT' },
    orderBy: { createdAt: 'asc' }
  })
  
  // Calculate trend
  const previousSevenDays = new Date(sevenDaysAgo)
  previousSevenDays.setDate(previousSevenDays.getDate() - 7)
  const previousTxs = await db.transaction.findMany({
    where: { userId, createdAt: { gte: previousSevenDays, lt: sevenDaysAgo }, type: 'ORDER_PAYMENT' },
  })

  const currentPeriodSpent = recentTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const previousPeriodSpent = previousTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  
  const spentTrend = previousPeriodSpent > 0 
    ? ((currentPeriodSpent - previousPeriodSpent) / previousPeriodSpent) * 100 
    : 100

  const d = dict.dashboard.overview

  return (
    <div className="space-y-5 md:space-y-8">
      {/* Welcome Hero */}
      <div className="relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 md:flex-row md:items-end md:p-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="mb-1.5 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{d.welcome}, {user.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base">{d.subtitle}</p>
        </div>
        <div className="relative z-10 grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:gap-3">
          <Link 
            href="/dashboard/wallet"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl border-blue-200 bg-white px-3 text-blue-600 shadow-sm hover:bg-blue-50 sm:rounded-full")}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {dict.dashboard.sidebar.addFunds}
          </Link>
          <Link 
            href="/dashboard/orders/new"
            className={cn(buttonVariants({ variant: "default" }), "h-10 rounded-xl bg-blue-600 px-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 sm:rounded-full")}
          >
            <Plus className="w-4 h-4 mr-2" />
            {dict.dashboard.sidebar.newOrder}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {/* Balance Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 sm:p-5 lg:p-6">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 sm:size-12">
              <Wallet className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="mb-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{d.balance}</p>
              <h3 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">฿{user.balance.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 sm:size-12">
              <ShoppingCart className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="mb-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{d.totalOrders}</p>
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">{totalOrders.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 sm:size-12">
              <Activity className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="mb-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{d.activeOrders}</p>
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">{activeOrders.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 sm:size-12">
              <TrendingUp className="size-5 sm:size-6" />
            </div>
            <div>
              <p className="mb-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{d.totalSpent}</p>
              <h3 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">฿{totalSpent.toFixed(2)}</h3>
            </div>
          </div>
          <div className="absolute right-3 top-3 hidden items-center gap-1 rounded border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-semibold sm:flex lg:right-6 lg:top-6">
            {spentTrend > 0 ? (
              <><ArrowUpRight className="w-3 h-3 text-red-500" /> <span className="text-slate-600">{Math.abs(spentTrend).toFixed(0)}%</span></>
            ) : (
              <><ArrowDownRight className="w-3 h-3 text-emerald-500" /> <span className="text-slate-600">{Math.abs(spentTrend).toFixed(0)}%</span></>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">{d.recentOrders}</h2>
            <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{d.viewAll}</Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" />
                <p>{d.noOrders}</p>
                <Link href="/dashboard/orders/new" className="text-blue-600 mt-2 hover:underline">{dict.dashboard.sidebar.newOrder}</Link>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">{dict.dashboard.orders.colService}</th>
                    <th className="px-6 py-3">{dict.dashboard.orders.colAmount}</th>
                    <th className="px-6 py-3 text-right">{dict.dashboard.orders.colStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 line-clamp-1">{order.service.name}</div>
                        <div className="text-xs text-slate-500 truncate w-48">{order.link}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">฿{order.charge.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={cn(
                          order.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          order.status === 'PROCESSING' || order.status === 'IN_PROGRESS' ? "bg-blue-50 text-blue-600 border-blue-200" :
                          order.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">{d.recentTransactions}</h2>
            <Link href="/dashboard/transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{d.viewAll}</Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Wallet className="w-12 h-12 text-slate-300 mb-3" />
                <p>{d.noTransactions}</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">{dict.dashboard.orders.colAmount}</th>
                    <th className="px-6 py-3 text-right">{dict.dashboard.orders.colDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{tx.type.replace('_', ' ')}</div>
                        <div className="text-xs text-slate-500">{tx.id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={tx.amount > 0 ? "text-emerald-600 font-medium" : "text-slate-900 font-medium"}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {tx.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
