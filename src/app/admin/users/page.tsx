import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, UserCircle } from 'lucide-react'

export default async function AdminUsersPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login')

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } }
    }
  })

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-500">View and manage all registered users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-slate-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Admins</div>
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'ADMIN').length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Balances</div>
          <div className="text-2xl font-bold text-emerald-600">฿{totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name || 'Unnamed'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={user.role === 'ADMIN' 
                      ? 'bg-blue-100 text-blue-700 border-none' 
                      : 'bg-slate-100 text-slate-600 border-none'
                    }>
                      {user.role === 'ADMIN' ? <><Shield className="w-3 h-3 mr-1" /> Admin</> : 'User'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-900">
                    {(user._count as any)?.orders || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-900">฿{user.balance.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
