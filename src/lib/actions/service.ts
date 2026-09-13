'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

import { calculateSellingPrice } from '@/lib/utils/pricing'

export async function updateService(
  id: string,
  data: {
    customerRate?: number
    markupType?: string
    markupValue?: number
    hidden?: boolean
    active?: boolean
    name?: string
    category?: string
  }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

    const service = await db.service.findUnique({ where: { id } })
    if (!service) throw new Error('Service not found')

    const updateData: any = {}
    
    if (data.markupType !== undefined) updateData.markupType = data.markupType
    if (data.markupValue !== undefined) updateData.markupValue = data.markupValue
    if (data.hidden !== undefined) updateData.hidden = data.hidden
    if (data.active !== undefined) updateData.active = data.active
    if (data.name !== undefined) updateData.name = data.name
    if (data.category !== undefined) updateData.category = data.category

    // If markup changed, recalculate customerRate
    if (data.markupType !== undefined || data.markupValue !== undefined) {
      const mType = data.markupType ?? service.markupType
      const mValue = data.markupValue ?? service.markupValue
      updateData.customerRate = calculateSellingPrice(service.providerRate, mType, mValue)
    } else if (data.customerRate !== undefined) {
      updateData.customerRate = data.customerRate
    }

    await db.service.update({ where: { id }, data: updateData })
    revalidatePath('/admin/services')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteService(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')
    
    // Check for existing orders
    const orderCount = await db.order.count({ where: { serviceId: id } })
    if (orderCount > 0) {
      // Just hide it instead of deleting
      await db.service.update({ where: { id }, data: { hidden: true, active: false } })
      return { success: true, message: 'Service hidden (has existing orders)' }
    }
    
    await db.service.delete({ where: { id } })
    revalidatePath('/admin/services')
    return { success: true, message: 'Service deleted' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function bulkUpdateMarkup(
  serviceIds: string[],
  markupType: string,
  markupValue: number
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

    const services = await db.service.findMany({
      where: { id: { in: serviceIds } }
    })

    let updated = 0
    for (const service of services) {
      const newRate = calculateSellingPrice(service.providerRate, markupType, markupValue)
      await db.service.update({
        where: { id: service.id },
        data: { markupType, markupValue, customerRate: newRate }
      })
      updated++
    }

    revalidatePath('/admin/services')
    return { success: true, updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
