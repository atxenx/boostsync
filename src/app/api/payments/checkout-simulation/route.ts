import { NextResponse } from 'next/server'
import { processPaymentWebhook } from '@/lib/actions/payment'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
  }

  try {
    await processPaymentWebhook(paymentId)
    // Redirect to wallet on success
    return NextResponse.redirect(new URL('/dashboard/wallet?success=1', request.url))
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.redirect(new URL('/dashboard/wallet?error=1', request.url))
  }
}
