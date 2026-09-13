export interface ProviderService {
  service: string
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
}

export interface CreateOrderParams {
  service: string
  link: string
  quantity: number
  runs?: number
  interval?: number
}

export interface CreateOrderResult {
  order: string
  error?: string
}

export interface OrderStatus {
  charge: string
  start_count: string
  status: 'Pending' | 'Processing' | 'In progress' | 'Completed' | 'Partial' | 'Canceled'
  remains: string
  currency: string
  error?: string
}

export interface SmmProvider {
  getServices(): Promise<ProviderService[]>
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>
  getOrderStatus(providerOrderId: string): Promise<OrderStatus>
  getMultipleOrderStatus(providerOrderIds: string[]): Promise<Record<string, OrderStatus>>
  getBalance(): Promise<{ balance: string; currency: string }>
}
