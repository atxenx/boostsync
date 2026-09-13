import { db } from '@/lib/db'
import { OrderForm } from '@/components/dashboard/order-form'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function NewOrderPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { dict } = await getDictionary()

  const services = await db.service.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { customerRate: 'asc' }]
  })

  return (
    <div className="w-full">
      <OrderForm services={services} dict={dict} />
    </div>
  )
}
