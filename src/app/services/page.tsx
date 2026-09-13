import { db } from '@/lib/db'
import Link from 'next/link'
import { Zap, ArrowLeft, Layers } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export const metadata = {
  title: 'Our Services | BoostSync',
  description: 'View all our available social media services and pricing.',
}

export default async function PublicServicesPage() {
  const { dict, locale } = await getDictionary();
  
  const services = await db.service.findMany({
    where: { active: true, hidden: false },
    orderBy: [{ category: 'asc' }, { customerRate: 'asc' }]
  })

  // Group services by category
  const categories = services.reduce((acc: Record<string, typeof services>, service) => {
    const cat = service.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">BoostSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {dict.nav.signIn}
            </Link>
            <Link 
              href="/register" 
              className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800")}
            >
              {dict.nav.getStarted}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">{dict.services.title}</h1>
          <p className="text-lg text-slate-600">
            {dict.services.subtitle}
          </p>
        </div>

        {Object.keys(categories).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">{dict.services.noServices}</h3>
            <p className="text-slate-500">{dict.services.checkBack}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categories).map(([category, catServices]) => (
              <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">{category}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">{dict.services.table.id}</th>
                        <th className="px-6 py-4 font-medium">{dict.services.table.service}</th>
                        <th className="px-6 py-4 font-medium">{dict.services.table.minMax}</th>
                        <th className="px-6 py-4 font-medium text-right">{dict.services.table.price}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {catServices.map((service) => (
                        <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            {service.id.slice(-6)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{service.name}</div>
                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                              {service.refillSupported && <span className="text-blue-600 font-medium">♻ {dict.services.table.refill}</span>}
                              {service.cancelSupported && <span className="text-amber-600 font-medium">✕ {dict.services.table.cancel}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {service.minQuantity} / {service.maxQuantity}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-sm">
                              ${service.customerRate.toFixed(3)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BoostSync. {dict.landing.footer}</p>
        </div>
      </footer>
    </div>
  )
}
