import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Settings, Eye, EyeOff, Package, DollarSign, Layers } from 'lucide-react'
import { ServiceActionButtons } from '@/components/admin/service-actions'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export const metadata = {
  title: 'Service Management | Admin Dashboard',
}

export default async function AdminServicesPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const { dict } = await getDictionary()

  const rawServices = await db.service.findMany({
    include: { provider: true },
    orderBy: [{ category: 'asc' }, { providerRate: 'asc' }]
  })

  // Add dynamic global sequential IDs (1, 2, 3, ...) across all services
  const services = rawServices.map((s, index) => ({ ...s, displayId: index + 1 }))

  const totalServices = services.length
  const activeServices = services.filter((s) => s.active && !s.hidden).length
  const hiddenServices = services.filter((s) => s.hidden).length

  // Group services by category
  const categories = services.reduce((acc: Record<string, typeof services>, service) => {
    const cat = service.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {})

  const d = dict.admin.services

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-500" />
            {d.title}
          </h1>
          <p className="text-slate-500 mt-1">{d.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{d.statsTotal}</p>
            <p className="text-2xl font-bold text-slate-900">{totalServices}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{d.statsActive}</p>
            <p className="text-2xl font-bold text-slate-900">{activeServices}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{d.statsHidden}</p>
            <p className="text-2xl font-bold text-slate-900">{hiddenServices}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([category, catServices]) => (
          <div key={category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{category}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">{d.colId}</th>
                    <th className="px-6 py-3 font-medium">{d.colName}</th>
                    <th className="px-6 py-3 font-medium">{d.colProvider}</th>
                    <th className="px-6 py-3 font-medium">{d.colProviderRate}</th>
                    <th className="px-6 py-3 font-medium">{d.colMarkup}</th>
                    <th className="px-6 py-3 font-medium">{d.colSellingPrice}</th>
                    <th className="px-6 py-3 font-medium">{d.colStatus}</th>
                    <th className="px-6 py-3 font-medium text-right">{d.colAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        #{service.displayId}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {service.provider?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        ${service.providerRate.toFixed(3)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                          {service.markupType === 'PERCENTAGE' 
                            ? `${service.markupValue}%` 
                            : `+฿${service.markupValue.toFixed(3)}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                          ${service.customerRate.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!service.active ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {d.statusInactive}
                          </Badge>
                        ) : service.hidden ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {d.statusHidden}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {d.statusActive}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-end">
                        <ServiceActionButtons 
                          serviceId={service.id}
                          name={service.name}
                          category={service.category || ''}
                          hidden={service.hidden}
                          active={service.active}
                          markupType={service.markupType}
                          markupValue={service.markupValue}
                          providerRate={service.providerRate}
                          customerRate={service.customerRate}
                        />
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
