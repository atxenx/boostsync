import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'

const formatType = (type: string) => type.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())

export default async function TransactionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [{ dict, locale }, transactions] = await Promise.all([
    getDictionary(),
    db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const copy = locale === 'th'
    ? { title: 'ประวัติการเงิน', subtitle: 'ตรวจสอบรายการเงินเข้าและเงินออกของบัญชีคุณ', empty: 'ยังไม่มีรายการทางการเงิน', details: 'รายละเอียด', type: 'ประเภท', amount: 'จำนวนเงิน', balance: 'ยอดคงเหลือหลังรายการ' }
    : { title: 'Transaction History', subtitle: 'Review every credit and payment made from your account.', empty: 'No transactions yet', details: 'Details', type: 'Type', amount: 'Amount', balance: 'Balance after' }

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <History className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 sm:text-base">{copy.subtitle}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100 md:hidden">
          {transactions.length === 0 ? (
            <div className="px-5 py-16 text-center text-slate-500">{copy.empty}</div>
          ) : transactions.map(transaction => {
            const isCredit = transaction.amount > 0
            return (
              <article key={transaction.id} className="flex items-center gap-3 p-4">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  {isCredit ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{transaction.reference || formatType(transaction.type)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{transaction.createdAt.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>{isCredit ? '+' : '−'}฿{Math.abs(transaction.amount).toFixed(2)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">฿{transaction.balanceAfter.toFixed(2)}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">{copy.details}</th>
                <th className="px-6 py-4">{copy.type}</th>
                <th className="px-6 py-4 text-right">{copy.amount}</th>
                <th className="px-6 py-4 text-right">{copy.balance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-500">{copy.empty}</td></tr>
              ) : transactions.map(transaction => {
                const isCredit = transaction.amount > 0
                return (
                  <tr key={transaction.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex size-9 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {isCredit ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                        </span>
                        <div><p className="font-medium text-slate-900">{transaction.reference || formatType(transaction.type)}</p><p className="mt-0.5 text-xs text-slate-400">{transaction.createdAt.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">{formatType(transaction.type)}</Badge></td>
                    <td className={`px-6 py-4 text-right font-semibold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>{isCredit ? '+' : '−'}฿{Math.abs(transaction.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">฿{transaction.balanceAfter.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
