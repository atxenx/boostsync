import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GenericSmmProvider } from '@/lib/providers/smm-provider'
import { processRefund } from '@/lib/actions/refund'
import { OrderStatus  } from '@/types/enums'

// To secure the cron job, you could require a secret header
// e.g. Authorization: Bearer CRON_SECRET

export async function GET(request: Request) {
  try {
    // 1. Get all active orders (PROCESSING, IN_PROGRESS, PENDING with a providerOrderId)
    const activeOrders = await db.order.findMany({
      where: {
        status: { in: [OrderStatus.PROCESSING, OrderStatus.IN_PROGRESS, OrderStatus.PENDING] },
        providerOrderId: { not: null },
        providerId: { not: null }
      },
      include: { provider: true }
    })

    if (activeOrders.length === 0) {
      return NextResponse.json({ success: true, message: 'No active orders to sync' })
    }

    // Group by provider to avoid multiple instantiations
    const providerGroups = activeOrders.reduce((acc, order) => {
      if (order.provider) {
        if (!acc[order.provider.id]) acc[order.provider.id] = []
        acc[order.provider.id].push(order)
      }
      return acc
    }, {} as Record<string, typeof activeOrders>)

    let updatedCount = 0

    for (const [providerId, orders] of Object.entries(providerGroups)) {
      const provider = orders[0].provider
      if (!provider || !provider.encryptedApiKey) continue

      const smm = new GenericSmmProvider(provider.apiUrl, provider.encryptedApiKey)
      const orderIds = orders.map(o => o.providerOrderId as string)

      try {
        const statuses = await smm.getMultipleOrderStatus(orderIds)

        for (const order of orders) {
          const statusResult = statuses[order.providerOrderId as string]
          if (!statusResult || statusResult.error) continue

          const newStatusRaw = statusResult.status?.toLowerCase()
          let parsedStatus: OrderStatus = order.status as OrderStatus
          let needsRefund = false
          let refundType: 'FULL' | 'PARTIAL' = 'FULL'

          switch (newStatusRaw) {
            case 'completed':
              parsedStatus = OrderStatus.COMPLETED
              break
            case 'processing':
            case 'pending':
              parsedStatus = OrderStatus.PROCESSING
              break
            case 'in progress':
              parsedStatus = OrderStatus.IN_PROGRESS
              break
            case 'partial':
              parsedStatus = OrderStatus.PARTIAL
              needsRefund = true
              refundType = 'PARTIAL'
              break
            case 'canceled':
            case 'cancelled':
              parsedStatus = OrderStatus.CANCELED
              needsRefund = true
              refundType = 'FULL'
              break
          }

          const remains = parseInt(statusResult.remains || '0')
          const startCount = parseInt(statusResult.start_count || '0')

          if (parsedStatus !== order.status || remains !== order.remains || startCount !== order.startCount) {
            if (needsRefund) {
              await processRefund(order.id, refundType, remains)
            } else {
              await db.order.update({
                where: { id: order.id },
                data: {
                  status: parsedStatus,
                  remains,
                  startCount
                }
              })
            }
            updatedCount++
          }
        }
      } catch (err) {
        console.error(`Failed to sync orders for provider ${providerId}`, err)
      }
    }

    return NextResponse.json({ success: true, updatedCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
