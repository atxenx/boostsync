'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { deductBalance, addBalance } from '@/lib/wallet'
import { GenericSmmProvider } from '@/lib/providers/smm-provider'
import { OrderStatus, TransactionType  } from '@/types/enums'

export async function createOrder(serviceId: string, link: string, quantity: number) {
  try {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    const userId = session.user.id

    // 1. Validate service
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { provider: true }
    })

    if (!service || !service.active) throw new Error('Service is unavailable')
    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      throw new Error(`Quantity must be between ${service.minQuantity} and ${service.maxQuantity}`)
    }

    // 2. Calculate price server-side
    // providerRate is usually per 1000, so we calculate (quantity / 1000) * customerRate
    // Wait, let's assume rate is per 1000. It's the standard for SMM panels.
    const price = (service.customerRate / 1000) * quantity
    const charge = parseFloat(price.toFixed(4))

    const providerCost = parseFloat(((service.providerRate / 1000) * quantity).toFixed(4))
    const sellingPrice = charge
    const profit = parseFloat((sellingPrice - providerCost).toFixed(4))

    // 3. Create Pending Order
    const order = await db.order.create({
      data: {
        userId,
        serviceId: service.id,
        providerId: service.provider?.id,
        link,
        quantity,
        charge,
        providerCost,
        sellingPrice,
        profit,
        status: OrderStatus.PENDING
      }
    })

    // 4. Deduct Balance
    try {
      await deductBalance(userId, charge, `ORDER_${order.id}`)
    } catch (err: any) {
      await db.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED }
      })
      throw new Error(err.message || 'Failed to deduct balance')
    }

    // 5. Send to Provider API
    if (!service.provider || !service.provider.encryptedApiKey) {
      // If no provider is attached (e.g. manual service), we just mark it PROCESSING for admin to do manually
      await db.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PROCESSING }
      })
      return { success: true, orderId: order.id }
    }

    try {
      const smm = new GenericSmmProvider(service.provider.apiUrl, service.provider.encryptedApiKey)
      const providerRes = await smm.createOrder({
        service: service.providerServiceId,
        link,
        quantity
      })

      if (providerRes.error) throw new Error(providerRes.error)

      // 6. Update order with provider ID
      await db.order.update({
        where: { id: order.id },
        data: {
          providerOrderId: String(providerRes.order),
          status: OrderStatus.PROCESSING
        }
      })

      return { success: true, orderId: order.id }
    } catch (apiError: any) {
      console.error('Provider API failed:', apiError)
      
      // 7. Refund and fail order
      await addBalance(userId, charge, TransactionType.REFUND, `REFUND_ORDER_${order.id}`)
      await db.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED }
      })

      throw new Error('Provider connection failed. Your balance has been refunded.')
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Order creation failed' }
  }
}
