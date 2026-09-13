import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Header } from '@/components/dashboard/header'
import { MobileMenuProvider } from '@/components/providers/mobile-menu-provider'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }
  
  const { locale } = await getDictionary()

  return (
    <MobileMenuProvider>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
          <Header user={session.user} locale={locale} />
          <main className="flex-1 p-4 md:p-8 overflow-auto w-full max-w-full">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileMenuProvider>
  )
}
