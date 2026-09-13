'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { GenericSmmProvider } from '@/lib/providers/smm-provider'

export async function createProvider(name: string, apiUrl: string, apiKey: string, defaultMarkupType: string = 'PERCENTAGE', defaultMarkupValue: number = 30) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')
    if (!name || !apiUrl || !apiKey) throw new Error('All fields are required')

    const provider = await db.provider.create({
      data: { name, apiUrl, encryptedApiKey: apiKey, active: true, defaultMarkupType, defaultMarkupValue }
    })

    revalidatePath('/admin/providers')
    return { success: true, provider }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProvider(id: string, name: string, apiUrl: string, apiKey: string, active: boolean, defaultMarkupType?: string, defaultMarkupValue?: number) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')
    if (!name || !apiUrl) throw new Error('Name and API URL are required')

    const provider = await db.provider.findUnique({ where: { id } })
    if (!provider) throw new Error('Provider not found')

    const data: any = { name, apiUrl, active }
    if (apiKey) data.encryptedApiKey = apiKey
    if (defaultMarkupType !== undefined) data.defaultMarkupType = defaultMarkupType
    if (defaultMarkupValue !== undefined) data.defaultMarkupValue = defaultMarkupValue

    await db.provider.update({ where: { id }, data })

    // Cascade active status to services
    if (provider.active !== active) {
      if (!active) {
        // If provider is deactivated, deactivate all its services
        await db.service.updateMany({
          where: { providerId: id },
          data: { active: false }
        })
      } else {
        // If provider is reactivated, reactivate its services (except hidden ones)
        await db.service.updateMany({
          where: { providerId: id, hidden: false },
          data: { active: true }
        })
      }
    }

    revalidatePath('/admin/providers')
    revalidatePath('/admin/services')
    return { success: true, message: 'Provider updated successfully' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProvider(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

    // This will cascade-delete all services for this provider
    await db.provider.delete({ where: { id } })
    revalidatePath('/admin/providers')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testProviderConnection(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

    const provider = await db.provider.findUnique({ where: { id } })
    if (!provider || !provider.encryptedApiKey) throw new Error('Provider not found or missing API key')

    const smm = new GenericSmmProvider(provider.apiUrl, provider.encryptedApiKey)
    const result = await smm.getBalance()

    return {
      success: true,
      balance: result.balance,
      currency: result.currency
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getProviderBalance(id: string) {
  return testProviderConnection(id)
}
