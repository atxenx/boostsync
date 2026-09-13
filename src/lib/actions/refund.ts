import { db } from '@/lib/db'
import { addBalance } from '@/lib/wallet'
import { OrderStatus, TransactionType  } from '@/types/enums'

export async function processRefund(orderId: string, type: 'FULL' | 'PARTIAL', remains: number = 0) {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId }
    })

    if (!order) throw new Error('Order not found')
    
    // Prevent double refunds
    if (order.status === OrderStatus.REFUNDED || order.status === OrderStatus.CANCELED) {
      throw new Error('Order is already refunded or canceled')
    }

    let refundAmount = 0
    let newStatus: OrderStatus = OrderStatus.REFUNDED

    if (type === 'FULL') {
      refundAmount = order.charge
      newStatus = OrderStatus.CANCELED
    } else if (type === 'PARTIAL') {
      if (order.quantity <= 0) throw new Error('Invalid order quantity')
      
      // Calculate proportional refund based on remains
      const pricePerItem = order.charge / order.quantity
      refundAmount = pricePerItem * remains
      newStatus = OrderStatus.PARTIAL
    }

    if (refundAmount > 0) {
      await addBalance(order.userId, refundAmount, TransactionType.REFUND, `REFUND_ORDER_${order.id}`)
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: newStatus, remains }
    })

    return updatedOrder
  })
}
