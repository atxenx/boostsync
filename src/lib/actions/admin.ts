'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { addBalance, deductBalance } from '@/lib/wallet'
import { TransactionType  } from '@/types/enums'

export async function adjustUserBalance(userId: string, amount: number, reason: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

    if (amount === 0) throw new Error('Amount cannot be zero')
    if (!reason) throw new Error('Reason is required')

    let updatedUser;

    if (amount > 0) {
      updatedUser = await addBalance(userId, amount, TransactionType.ADJUSTMENT, `ADMIN_ADJ_${Date.now()}`)
    } else {
      updatedUser = await deductBalance(userId, Math.abs(amount), `ADMIN_ADJ_${Date.now()}`, 'Admin Adjustment')
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BALANCE_ADJUSTMENT',
        metadata: JSON.stringify({ targetUserId: userId, amount, reason })
      }
    })

    return { success: true, balance: updatedUser.balance }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to adjust balance' }
  }
}
