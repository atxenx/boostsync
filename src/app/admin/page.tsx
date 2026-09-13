import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { OrderStatus } from '@/types/enums'
import { Users, ShoppingCart, DollarSign, Activity, AlertCircle, TrendingUp, Percent } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const { dict } = await getDictionary()

  const [
    totalUsers,
    totalOrders,
    pendingOrders,
    failedOrders,
    revenueAgg,
    profitAgg,
    totalServices,
    totalProviders
  ] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.order.count({ where: { status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.IN_PROGRESS] } } }),
    db.order.count({ where: { status: { in: [OrderStatus.FAILED, OrderStatus.CANCELED] } } }),
    db.order.aggregate({
      where: { status: { notIn: [OrderStatus.FAILED, OrderStatus.CANCELED, OrderStatus.REFUNDED] } },
      _sum: { charge: true }
    }),
    db.order.aggregate({
      where: { status: { notIn: [OrderStatus.FAILED, OrderStatus.CANCELED, OrderStatus.REFUNDED] } },
      _sum: { profit: true, providerCost: true }
    }),
    db.service.count({ where: { active: true } }),
    db.provider.count({ where: { active: true } })
  ])

  const revenue = revenueAgg._sum.charge || 0
  const totalProfit = profitAgg._sum.profit || 0
  const totalProviderCost = profitAgg._sum.providerCost || 0
  const profitMargin = revenue > 0 ? ((totalProfit / revenue) * 100) : 0

  const d = dict.admin.overview

  const metrics = [
    { label: d.totalRevenue, value: `฿${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'From completed orders' },
    { label: 'Total Profit', value: `฿${totalProfit.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: `${profitMargin.toFixed(1)}% margin` },
    { label: 'Provider Cost', value: `฿${totalProviderCost.toFixed(2)}`, icon: Percent, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Total API spend' },
    { label: d.totalUsers, value: totalUsers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Registered accounts' },
    { label: dict.dashboard.overview.totalOrders, value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50', sub: `${pendingOrders} active` },
    { label: 'Failed / Canceled', value: failedOrders.toLocaleString(), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', sub: 'Needs attention' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{d.title}</h1>
        <p className="text-slate-500">{d.subtitle}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.bg}`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500 mb-1">{m.label}</div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{m.value}</div>
            <div className="text-xs text-slate-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-slate-500 mb-1">{d.activeProviders}</div>
            <div className="text-xl font-bold text-slate-900">{totalProviders}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">{d.totalServices}</div>
            <div className="text-xl font-bold text-slate-900">{totalServices}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Pending Orders</div>
            <div className="text-xl font-bold text-amber-600">{pendingOrders}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Profit Margin</div>
            <div className="text-xl font-bold text-blue-600">{profitMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
