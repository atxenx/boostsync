import { db } from '@/lib/db'
import { TransactionType  } from '@/types/enums'

export async function deductBalance(
  userId: string,
  amount: number,
  reference: string,
  description: string = 'Order Payment'
) {
  return await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    if (!user) throw new Error('User not found')
    if (user.balance < amount) throw new Error('Insufficient balance')

    const newBalance = user.balance - amount

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    })

    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.ORDER_PAYMENT,
        amount: -amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        reference,
        status: 'COMPLETED'
      }
    })

    return updatedUser
  })
}

export async function addBalance(
  userId: string,
  amount: number,
  type: TransactionType,
  reference: string
) {
  return await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    if (!user) throw new Error('User not found')

    const newBalance = user.balance + amount

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    })

    await tx.transaction.create({
      data: {
        userId,
        type,
        amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        reference,
        status: 'COMPLETED'
      }
    })

    return updatedUser
  })
}
