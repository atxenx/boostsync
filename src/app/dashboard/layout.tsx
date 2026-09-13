import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import { db } from '@/lib/db'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  
  const { locale, dict } = await getDictionary()

  let balance = 0
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true }
    })
    if (user) balance = user.balance
  }

  return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar user={session.user} balance={balance} dict={dict} />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
          <Header user={session.user} locale={locale} />
          <main className="flex-1 w-full max-w-full overflow-x-hidden p-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:p-8">
            <div className="mx-auto w-full max-w-6xl">
              {children}
            </div>
          </main>
        </div>
        <MobileBottomNav dict={dict} />
      </div>
  )
}
