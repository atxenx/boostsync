import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AddProviderForm, ProviderCard } from '@/components/admin/provider-management'
import { Server, Wifi } from 'lucide-react'

export default async function ProvidersPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const providers = await db.provider.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { services: true } }
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">API Providers</h1>
          <p className="text-slate-500">Manage your SMM API provider connections and sync services.</p>
        </div>
        <AddProviderForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Providers</div>
          <div className="text-2xl font-bold text-slate-900">{providers.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{providers.filter(p => p.active).length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Services</div>
          <div className="text-2xl font-bold text-blue-600">{providers.reduce((sum, p) => sum + (p._count?.services || 0), 0)}</div>
        </div>
      </div>

      {/* Provider Cards */}
      {providers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No providers configured</h3>
          <p className="text-slate-500 mb-4">Add your first SMM API provider to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map(provider => (
            <ProviderCard key={provider.id} provider={provider as any} />
          ))}
        </div>
      )}
    </div>
  )
}
