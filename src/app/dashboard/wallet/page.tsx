import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { DepositForm } from '@/components/dashboard/deposit-form'
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, History } from 'lucide-react'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function WalletPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [{ locale }, user, transactions] = await Promise.all([
    getDictionary(),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true }
    }),
    db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ])

  if (!user) redirect('/login')

  const isThai = locale === 'th'
  const copy = isThai ? {
    title: 'กระเป๋าเงิน',
    subtitle: 'เติมเงินและตรวจสอบรายการเคลื่อนไหวในบัญชี',
    balance: 'ยอดเงินคงเหลือ',
    secure: 'ชำระเงินอย่างปลอดภัย',
    recent: 'รายการล่าสุด',
    viewAll: 'ดูทั้งหมด',
    empty: 'ยังไม่มีรายการทางการเงิน',
    balanceAfter: 'คงเหลือ',
    deposit: {
      title: 'เติมเงิน', subtitle: 'เลือกจำนวนและช่องทางที่สะดวก', amount: 'จำนวนเงิน (บาท)', paymentMethod: 'ช่องทางชำระเงิน',
      card: 'บัตรเครดิต / เดบิต', crypto: 'คริปโทเคอร์เรนซี', promptPay: 'พร้อมเพย์ QR', processing: 'กำลังดำเนินการ...', pay: 'ดำเนินการต่อ',
    },
  } : {
    title: 'Wallet',
    subtitle: 'Add funds and review activity in your account.',
    balance: 'Available balance',
    secure: 'Secure payments',
    recent: 'Recent transactions',
    viewAll: 'View all',
    empty: 'No transactions yet',
    balanceAfter: 'Balance',
    deposit: {
      title: 'Add funds', subtitle: 'Choose an amount and payment method.', amount: 'Amount (THB)', paymentMethod: 'Payment method',
      card: 'Credit or debit card', crypto: 'Cryptocurrency', promptPay: 'PromptPay QR', processing: 'Processing...', pay: 'Continue',
    },
  }

  const transactionLabel = (type: string) => {
    const labels: Record<string, [string, string]> = {
      ORDER_PAYMENT: ['ชำระคำสั่งซื้อ', 'Order payment'],
      REFUND: ['คืนเงินคำสั่งซื้อ', 'Order refund'],
      DEPOSIT: ['เติมเงินเข้ากระเป๋า', 'Wallet top-up'],
      PAYMENT: ['เติมเงินเข้ากระเป๋า', 'Wallet top-up'],
      ADJUSTMENT: ['ปรับยอดเงิน', 'Balance adjustment'],
    }
    return labels[type]?.[isThai ? 0 : 1] || (isThai ? 'รายการทางการเงิน' : 'Account transaction')
  }

  const typeLabel = (type: string) => {
    if (type.includes('REFUND')) return isThai ? 'คืนเงิน' : 'Refund'
    if (type.includes('ORDER')) return isThai ? 'ชำระเงิน' : 'Payment'
    if (type.includes('DEPOSIT') || type === 'PAYMENT') return isThai ? 'เติมเงิน' : 'Top-up'
    return isThai ? 'ปรับยอด' : 'Adjustment'
  }

  const referenceLabel = (reference: string | null) => reference
    ? `#${reference.split('_').at(-1)?.slice(-8).toUpperCase()}`
    : null

  const formatMoney = (value: number) => new Intl.NumberFormat(isThai ? 'th-TH' : 'en-US', {
    style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Math.abs(value) < 0.005 ? 0 : value)

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <h1 className="mb-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">{copy.title}</h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">{copy.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 md:gap-8">
        
        {/* Balance Card */}
        <div className="space-y-5 md:col-span-1 md:space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-[#0a1128] p-5 text-white shadow-xl shadow-blue-900/20 sm:p-6 md:rounded-3xl md:p-8">
            <div className="absolute right-0 top-0 p-4 opacity-15 sm:p-6">
              <Wallet className="size-20 sm:size-24" />
            </div>
            <div className="relative z-10">
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-blue-200 sm:text-sm">{copy.balance}</div>
              <div className="mb-5 text-4xl font-bold sm:mb-6 sm:text-5xl">{formatMoney(user.balance)}</div>
              
              <div className="flex items-center gap-2 text-sm text-blue-100 bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {copy.secure}
              </div>
            </div>
          </div>

          <DepositForm copy={copy.deposit} />
        </div>

        {/* Transactions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-6">
              <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 sm:size-10">
                <History className="w-5 h-5 text-slate-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">{copy.recent}</h2>
              </div>
              <Link href="/dashboard/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">{copy.viewAll}</Link>
            </div>
            
            <div className="divide-y divide-slate-100 md:hidden">
              {transactions.length === 0 ? (
                <div className="px-5 py-14 text-center text-sm text-slate-500">{copy.empty}</div>
              ) : transactions.map(tx => {
                const isPositive = tx.amount > 0
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-4">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {isPositive ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{transactionLabel(tx.type)}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{tx.createdAt.toLocaleDateString(isThai ? 'th-TH' : 'en-US')} {referenceLabel(tx.reference)}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>{isPositive ? '+' : ''}{formatMoney(tx.amount)}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{copy.balanceAfter} {formatMoney(tx.balanceAfter)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">{isThai ? 'รายละเอียด' : 'Transaction'}</th>
                    <th className="px-6 py-4">{isThai ? 'ประเภท' : 'Type'}</th>
                    <th className="px-6 py-4 text-right">{isThai ? 'จำนวนเงิน' : 'Amount'}</th>
                    <th className="px-6 py-4 text-right">{isThai ? 'ยอดคงเหลือ' : 'Balance after'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        {copy.empty}
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => {
                      const isPositive = tx.amount > 0
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{transactionLabel(tx.type)}</div>
                                <div className="text-xs text-slate-400">{tx.createdAt.toLocaleString(isThai ? 'th-TH' : 'en-US')} {referenceLabel(tx.reference)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="border-none bg-slate-100 text-slate-600">{typeLabel(tx.type)}</Badge>
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isPositive ? '+' : ''}{formatMoney(tx.amount)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-500">
                            {formatMoney(tx.balanceAfter)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
