'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { PaymentStatus, TransactionType  } from '@/types/enums'
import { addBalance } from '@/lib/wallet'

export async function createPayment(amount: number, provider: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    if (amount < 1) {
      throw new Error('Minimum deposit is ฿1')
    }

    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount,
        provider,
        status: PaymentStatus.PENDING
      }
    })

    // Here you would integrate with Stripe, PayPal, or a Thai payment provider (e.g. PromptPay, Omise)
    // and return the checkout URL or QR code data.
    
    // For this architecture, we will return a simulated checkout link that just calls a webhook/success page.
    return { 
      success: true, 
      paymentId: payment.id,
      checkoutUrl: `/api/payments/checkout-simulation?paymentId=${payment.id}`
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment creation failed' }
  }
}

// Simulated webhook processor for architecture purposes
export async function processPaymentWebhook(paymentId: string) {
  return await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) throw new Error('Payment not found')
    if (payment.status !== PaymentStatus.PENDING) throw new Error('Payment already processed')

    await tx.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.COMPLETED }
    })

    await addBalance(payment.userId, payment.amount, TransactionType.DEPOSIT, `PAYMENT_${payment.id}`)

    return { success: true }
  })
}
