import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Camera, MessageCircle, Video, Globe, Music, Share2, LayoutList } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import Link from 'next/link'

export const metadata = {
  title: 'Services | BoostSync',
}

export default async function ServicesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { dict } = await getDictionary()

  const rawServices = await db.service.findMany({
    where: { active: true, hidden: false },
    orderBy: [{ category: 'asc' }, { customerRate: 'asc' }]
  })

  // Add dynamic global sequential IDs (1, 2, 3, ...) across all services
  const services = rawServices.map((s, index) => ({ ...s, displayId: index + 1 }))

  // Group services by category
  const grouped = services.reduce((acc: Record<string, typeof services>, service) => {
    const cat = service.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {})

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('instagram') || cat.includes('ig')) return <Camera className="w-5 h-5 text-pink-500" />
    if (cat.includes('twitter') || cat.includes('x ')) return <MessageCircle className="w-5 h-5 text-sky-500" />
    if (cat.includes('youtube') || cat.includes('yt')) return <Video className="w-5 h-5 text-red-600" />
    if (cat.includes('facebook') || cat.includes('fb')) return <Globe className="w-5 h-5 text-blue-600" />
    if (cat.includes('tiktok')) return <Share2 className="w-5 h-5 text-slate-800" />
    if (cat.includes('spotify') || cat.includes('soundcloud') || cat.includes('audiomack')) return <Music className="w-5 h-5 text-emerald-500" />
    return <LayoutList className="w-5 h-5 text-slate-400" />
  }

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <h1 className="mb-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">{dict.dashboard.sidebar.services}</h1>
        <p className="text-sm text-slate-500 sm:text-base">{dict.dashboard.overview.welcome}</p>
      </div>

      <div className="space-y-5 md:space-y-10">
        {Object.entries(grouped).map(([category, svcs]) => (
          <div key={category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                {getCategoryIcon(category)}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{category}</h2>
            </div>
            
            <div className="divide-y divide-slate-100 md:hidden">
              {svcs.map((svc) => (
                <div key={svc.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium text-slate-400">#{svc.displayId}</p>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-relaxed text-slate-800">{svc.name}</h3>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-900">฿{Number(svc.customerRate).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">{svc.minQuantity.toLocaleString()}–{svc.maxQuantity.toLocaleString()} units</span>
                    <Link href={`/dashboard/orders/new?serviceId=${svc.id}`} className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                      Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase">
                    <th className="px-6 py-3 font-medium w-16">ID</th>
                    <th className="px-6 py-3 font-medium">Service Name</th>
                    <th className="px-6 py-3 font-medium text-right">Price / 1k</th>
                    <th className="px-6 py-3 font-medium text-right">Min / Max</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {svcs.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-medium">#{svc.displayId}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700">
                          {svc.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">฿{Number(svc.customerRate).toFixed(3)}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs">
                        {svc.minQuantity.toLocaleString()} / {svc.maxQuantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 flex justify-end">
                        <Link 
                          href={`/dashboard/orders/new?serviceId=${svc.id}`} 
                          className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors inline-flex items-center justify-center shadow-sm text-white text-xs font-bold whitespace-nowrap"
                        >
                          Order Now
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
