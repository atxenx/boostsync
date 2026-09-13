'use client'

import { useState, useActionState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { createPayment } from '@/lib/actions/payment'

export interface DepositFormCopy {
  title: string
  subtitle: string
  amount: string
  paymentMethod: string
  card: string
  crypto: string
  promptPay: string
  processing: string
  pay: string
}

export function DepositForm({ copy }: { copy: DepositFormCopy }) {
  const [amount, setAmount] = useState<number>(100)
  const [provider, setProvider] = useState<string>('credit_card')
  const paymentLabels: Record<string, string> = {
    credit_card: copy.card,
    crypto: copy.crypto,
    promptpay: copy.promptPay,
  }
  
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await createPayment(amount, provider)
      return res
    },
    null
  )

  useEffect(() => {
    if (state?.success && state?.checkoutUrl) {
      window.location.href = state.checkoutUrl
    }
  }, [state])

  return (
    <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form action={formAction} className="space-y-5 sm:space-y-6">
          <div className="space-y-3">
            <Label htmlFor="deposit-amount" className="text-slate-700 font-semibold">{copy.amount}</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">฿</span>
              <Input 
                id="deposit-amount"
                name="amount"
                type="number"
                value={amount} 
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                min={1} 
                step={0.01}
                required
                className="h-12 border-slate-200 bg-slate-50 pl-8 text-base font-bold sm:h-14 sm:text-lg"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  aria-pressed={amount === val}
                  className={`min-w-0 rounded-xl border px-1.5 py-2 text-xs font-medium transition-colors sm:rounded-full sm:px-3 sm:text-sm ${
                    amount === val 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ฿{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="payment-method" className="text-slate-700 font-semibold">{copy.paymentMethod}</Label>
            <Select value={provider} onValueChange={(val) => setProvider(val as string)}>
              <SelectTrigger id="payment-method" className="h-12 w-full border-slate-200 bg-slate-50 sm:h-14">
                <span className="truncate text-left">{paymentLabels[provider]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">{copy.card}</SelectItem>
                <SelectItem value="promptpay">{copy.promptPay}</SelectItem>
                <SelectItem value="crypto">{copy.crypto}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state?.error && (
            <div className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-lg border border-red-100">
              {state.error}
            </div>
          )}

          <Button type="submit" className="h-12 w-full rounded-xl bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 sm:h-14" disabled={pending || amount < 1}>
            {pending ? copy.processing : `${copy.pay} ฿${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
