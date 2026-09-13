import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const limit = 20
  const skip = (currentPage - 1) * limit

  const [totalOrders, totalRevenueAgg, totalProfitAgg, orders] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ _sum: { charge: true } }),
    db.order.aggregate({ _sum: { profit: true } }),
    db.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { service: true, user: true },
    })
  ])

  const totalPages = Math.ceil(totalOrders / limit)
  const totalRevenue = totalRevenueAgg._sum.charge || 0
  const totalProfit = totalProfitAgg._sum.profit || 0

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Orders</h1>
          <p className="text-slate-500">Manage and monitor all platform orders.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">฿{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Profit</p>
              <p className="text-2xl font-bold text-slate-900">฿{totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4 whitespace-nowrap">Link</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4 whitespace-nowrap">Provider Cost</th>
                <th className="px-6 py-4 whitespace-nowrap">Selling Price</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => {
                let badgeColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                if (order.status === 'COMPLETED') {
                  badgeColor = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                } else if (order.status === 'PROCESSING' || order.status === 'IN_PROGRESS' || order.status === 'PENDING') {
                  badgeColor = 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                } else if (order.status === 'FAILED' || order.status === 'CANCELED') {
                  badgeColor = 'bg-red-100 text-red-700 hover:bg-red-200'
                }

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 whitespace-nowrap">{order.user.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 whitespace-nowrap">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-medium text-slate-900 truncate" title={order.service.name}>{order.service.name}</div>
                      <div className="text-xs text-slate-500 truncate">{order.service.category}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[150px]">
                      <a href={order.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate" title={order.link}>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.link}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      ${(order.providerCost || 0).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      ${(order.charge || 0).toFixed(4)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      ${(order.profit || 0).toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn("font-medium border-0", badgeColor)} variant="outline">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString()} <br />
                      {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{skip + 1}</span> to <span className="font-medium">{Math.min(skip + limit, totalOrders)}</span> of <span className="font-medium">{totalOrders}</span> orders
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href={currentPage > 1 ? `/admin/orders?page=${currentPage - 1}` : '#'}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'rounded-full',
                  currentPage <= 1 && 'pointer-events-none opacity-50'
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Link>
              <Link 
                href={currentPage < totalPages ? `/admin/orders?page=${currentPage + 1}` : '#'}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'rounded-full',
                  currentPage >= totalPages && 'pointer-events-none opacity-50'
                )}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
