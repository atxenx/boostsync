import { CreateOrderParams, CreateOrderResult, OrderStatus, ProviderService, SmmProvider } from '@/types/provider'

export class GenericSmmProvider implements SmmProvider {
  private apiUrl: string
  private apiKey: string

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  private async request<T>(data: Record<string, any>): Promise<T> {
    const formData = new URLSearchParams()
    formData.append('key', this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(`Provider returned error: ${result.error}`)
      }
      
      return result as T
    } catch (error) {
      console.error('SMM Provider request failed:', error)
      throw error
    }
  }

  async getServices(): Promise<ProviderService[]> {
    return this.request<ProviderService[]>({ action: 'services' })
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    return this.request<CreateOrderResult>({
      action: 'add',
      ...params,
    })
  }

  async getOrderStatus(providerOrderId: string): Promise<OrderStatus> {
    return this.request<OrderStatus>({
      action: 'status',
      order: providerOrderId,
    })
  }

  async getMultipleOrderStatus(providerOrderIds: string[]): Promise<Record<string, OrderStatus>> {
    return this.request<Record<string, OrderStatus>>({
      action: 'status',
      orders: providerOrderIds.join(','),
    })
  }

  async getBalance(): Promise<{ balance: string; currency: string }> {
    return this.request<{ balance: string; currency: string }>({ action: 'balance' })
  }
}
