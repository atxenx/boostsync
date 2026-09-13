import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ListOrdered, Plus } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function OrdersHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { dict } = await getDictionary()

  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page || '1')
  const take = 20
  const skip = (page - 1) * take

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    db.order.count({ where: { userId: session.user.id } })
  ])

  const totalPages = Math.ceil(total / take)

  const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-700'
    if (['PROCESSING', 'IN_PROGRESS', 'PENDING'].includes(status)) return 'bg-blue-100 text-blue-700'
    if (['FAILED', 'CANCELED', 'REFUNDED'].includes(status)) return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-700'
  }

  const d = dict.dashboard.orders

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="mb-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">{d.title}</h1>
          <p className="text-sm text-slate-500 sm:text-base">{d.subtitle} <span className="font-medium text-slate-700">{total}</span> total.</p>
        </div>
        <Link href="/dashboard/orders/new" className={cn(buttonVariants(), "h-10 w-full rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 sm:w-auto sm:rounded-full")}>
          <Plus className="w-4 h-4 mr-2" /> {dict.dashboard.sidebar.newOrder}
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 md:hidden">
          {orders.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <ListOrdered className="mx-auto mb-3 size-10 text-slate-300" />
              <h3 className="font-bold text-slate-900">{dict.dashboard.overview.noOrders}</h3>
              <Link href="/dashboard/orders/new" className="mt-2 inline-block text-sm font-medium text-blue-600">{dict.dashboard.sidebar.newOrder}</Link>
            </div>
          ) : orders.map(order => (
            <article key={order.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-xs text-slate-400">#{order.id.slice(-6)} · {order.createdAt.toLocaleDateString()}</p>
                  <h2 className="line-clamp-2 text-sm font-semibold leading-relaxed text-slate-900">{order.service.name}</h2>
                </div>
                <span className={cn("shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase", statusColor(order.status))}>{order.status}</span>
              </div>
              <a href={order.link} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-blue-600">{order.link}</a>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">{order.quantity.toLocaleString()} units</span>
                <span className="font-bold text-slate-900">฿{order.charge.toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{d.colId}</th>
                <th className="px-6 py-4">{d.colService}</th>
                <th className="px-6 py-4">{d.colLink}</th>
                <th className="px-6 py-4 text-center">{d.colAmount}</th>
                <th className="px-6 py-4 text-right">{dict.dashboard.newOrder.charge}</th>
                <th className="px-6 py-4 text-right">{d.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ListOrdered className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{dict.dashboard.overview.noOrders}</h3>
                    <p className="text-slate-500 mb-4">Place your first order to get started.</p>
                    <Link href="/dashboard/orders/new" className={cn(buttonVariants(), "rounded-full")}>
                      {dict.dashboard.sidebar.newOrder}
                    </Link>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-medium text-slate-900">#{order.id.slice(-6)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.createdAt.toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 max-w-[200px] truncate">{order.service.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.service.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={order.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs max-w-[150px] truncate inline-block">
                        {order.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-900">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ฿{order.charge.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("px-2.5 py-1 text-[10px] uppercase font-bold rounded", statusColor(order.status))}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 flex justify-between items-center bg-slate-50/50">
            <div className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/dashboard/orders?page=${page - 1}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), page <= 1 && "pointer-events-none opacity-50")}
              >
                Previous
              </Link>
              <Link 
                href={`/dashboard/orders?page=${page + 1}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), page >= totalPages && "pointer-events-none opacity-50")}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
