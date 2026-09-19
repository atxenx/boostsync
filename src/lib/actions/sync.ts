'use server'

import { db } from '@/lib/db'
import { GenericSmmProvider } from '@/lib/providers/smm-provider'
import { auth } from '@/auth'
import { ProviderService } from '@/types/provider'
import { calculateSellingPrice } from '@/lib/utils/pricing'

export async function syncServices(providerId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      throw new Error('Unauthorized')
    }

    const provider = await db.provider.findUnique({
      where: { id: providerId }
    })

    if (!provider || !provider.encryptedApiKey) {
      throw new Error('Provider not found or missing API key')
    }

    // In a real scenario, you'd decrypt the API key here if it was encrypted.
    const smm = new GenericSmmProvider(provider.apiUrl, provider.encryptedApiKey)
    const providerServices: ProviderService[] = await smm.getServices()

    let created = 0
    let updated = 0

    // Read the catalog once instead of making a lookup for every remote service.
    const existingServices = await db.service.findMany({
      where: { providerId },
      select: { id: true, providerServiceId: true }
    })
    const servicesByProviderId = new Map(existingServices.map(service => [service.providerServiceId, service]))

    // Helper to safely parse truthy values from APIs
    const isTrue = (val: any) => val === true || val === 'true' || val === 1 || val === '1'

    for (const ps of providerServices) {
      const existingService = servicesByProviderId.get(String(ps.service))

      const pRate = parseFloat(ps.rate)

      if (existingService) {
        await db.service.update({
          where: { id: existingService.id },
          data: {
            name: ps.name,
            category: ps.category,
            type: ps.type,
            minQuantity: parseInt(ps.min),
            maxQuantity: parseInt(ps.max),
            providerRate: pRate,
            refillSupported: isTrue(ps.refill),
            cancelSupported: isTrue(ps.cancel),
            // DO NOT overwrite custom customerRate when syncing
          }
        })
        updated++
      } else {
        const newService = await db.service.create({
          data: {
            providerId,
            providerServiceId: String(ps.service),
            name: ps.name,
            platform: 'Unknown', // To be categorized manually or extracted from category
            category: ps.category,
            type: ps.type,
            minQuantity: parseInt(ps.min),
            maxQuantity: parseInt(ps.max),
            providerRate: pRate,
            customerRate: calculateSellingPrice(pRate, provider.defaultMarkupType, provider.defaultMarkupValue),
            markupType: provider.defaultMarkupType,
            markupValue: provider.defaultMarkupValue,
            refillSupported: isTrue(ps.refill),
            cancelSupported: isTrue(ps.cancel),
            active: true
          }
        })
        servicesByProviderId.set(newService.providerServiceId, newService)
        created++
      }
    }

    return {
      success: true,
      message: `Sync completed. Created: ${created}, Updated: ${updated}`,
      created,
      updated
    }
  } catch (error: any) {
    console.error('Sync Error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred during sync'
    }
  }
}
