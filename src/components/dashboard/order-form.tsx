'use client'

import { useState, useActionState, useEffect } from 'react'
import type { Service } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { createOrder } from '@/lib/actions/order'
import { useRouter } from 'next/navigation'
import { Camera, MessageCircle, Video, Globe, Music, Share2, Component, LayoutList } from 'lucide-react'
import { Dictionary } from '@/lib/i18n/dictionaries'

export function OrderForm({ services, dict }: { services: Service[], dict?: Dictionary }) {
  const router = useRouter()
  
  // Use dict if provided, fallback to default labels if not
  const d = dict?.dashboard?.newOrder || {
    title: "Create New Order",
    subtitle: "Configure your order details below.",
    category: "Platform",
    categoryPlaceholder: "Select a platform...",
    service: "Service",
    servicePlaceholder: "Select a service...",
    link: "Target Link",
    linkPlaceholder: "https://",
    quantity: "Quantity",
    pricePerThousand: "Price per 1,000",
    charge: "Total Charge",
    submit: "Place Order",
    minMax: "Min: {min} / Max: {max}",
    description: "Service Description",
    success: "Order Placed Successfully!",
    error: "Failed to place order. Please try again."
  }
  
  // Add dynamic global sequential IDs (1, 2, 3, ...) across all services
  const mappedServices = services.map((s, index) => ({ ...s, displayId: index + 1 }))
  
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(0)
  
  const categories = Array.from(new Set(mappedServices.map(s => s.category))).sort()
  const filteredServices = mappedServices.filter(s => s.category === selectedCategory)
  
  const selectedService = mappedServices.find(s => s.id === selectedServiceId)
  const serviceNameParts = selectedService?.name
    .split('|')
    .map(part => part.trim())
    .filter(Boolean) || []
  
  const price = selectedService ? (selectedService.customerRate / 1000) * quantity : 0
  const formatPrice = (value: number) => `฿${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`
  const orderIsValid = Boolean(
    selectedService &&
    quantity >= selectedService.minQuantity &&
    quantity <= selectedService.maxQuantity
  )
  
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const link = formData.get('link') as string
      const res = await createOrder(selectedServiceId, link, quantity)
      return res
    },
    null
  )

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/orders')
      router.refresh()
    }
  }, [state, router])

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('instagram') || cat.includes('ig')) return <Camera className="w-4 h-4 text-pink-600" />
    if (cat.includes('twitter') || cat.includes('x ')) return <MessageCircle className="w-4 h-4 text-sky-500" />
    if (cat.includes('youtube') || cat.includes('yt')) return <Video className="w-4 h-4 text-red-600" />
    if (cat.includes('facebook') || cat.includes('fb')) return <Globe className="w-4 h-4 text-blue-600" />
    if (cat.includes('tiktok')) return <Share2 className="w-4 h-4 text-slate-800" />
    if (cat.includes('spotify') || cat.includes('soundcloud') || cat.includes('audiomack')) return <Music className="w-4 h-4 text-emerald-500" />
    return <LayoutList className="w-4 h-4 text-slate-400" />
  }

  return (
    <div className="max-w-full min-w-0 space-y-4 overflow-x-hidden pb-24 lg:space-y-6 lg:overflow-visible lg:pb-0">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 md:text-3xl">{d.title}</h1>
        <p className="text-sm leading-relaxed text-slate-500 md:text-base">{d.subtitle}</p>
      </div>

      <div className="grid min-w-0 max-w-full items-start gap-5 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 max-w-full space-y-6 lg:col-span-2">
          <Card className="min-w-0 max-w-full overflow-hidden border-slate-100 shadow-sm">
          <div className="h-1 bg-blue-600 w-full" />
          <CardContent className="min-w-0 max-w-full p-4 lg:p-6">
            <form action={formAction} className="min-w-0 max-w-full space-y-5 lg:space-y-6" id="order-form">
              <div className="min-w-0 space-y-2">
                <Label className="text-slate-700 font-semibold">{d.category}</Label>
                <Select value={selectedCategory} onValueChange={(val) => {
                  setSelectedCategory(val as string)
                  setSelectedServiceId('')
                  setQuantity(0)
                }}>
                  <SelectTrigger className="h-12 w-full min-w-0 max-w-full overflow-hidden border-slate-200 bg-slate-50">
                    {selectedCategory ? (
                      <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden pr-2 text-slate-900">
                        {getCategoryIcon(selectedCategory)}
                        <span className="min-w-0 flex-1 truncate">{selectedCategory}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">{d.categoryPlaceholder}</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    {categories.map(c => (
                      <SelectItem key={c} value={c} className="min-w-0 overflow-hidden">
                        <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden">
                          {getCategoryIcon(c)}
                          <span className="min-w-0 flex-1 truncate">{c}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="min-w-0 space-y-2">
                  <Label className="text-slate-700 font-semibold">{d.service}</Label>
                  <Select value={selectedServiceId} onValueChange={(val) => {
                    const nextService = mappedServices.find(service => service.id === val)
                    setSelectedServiceId(val as string)
                    if (nextService) {
                      setQuantity(Math.min(Math.max(1000, nextService.minQuantity), nextService.maxQuantity))
                    }
                  }}>
                    <SelectTrigger className="h-12 w-full min-w-0 max-w-full overflow-hidden border-slate-200 bg-slate-50">
                      {selectedService ? (
                        <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden pr-2 text-slate-900">
                          <span className="text-slate-500 font-mono text-xs shrink-0">#{selectedService.displayId}</span>
                          <span className="min-w-0 flex-1 truncate">{selectedService.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">{d.servicePlaceholder}</span>
                      )}
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)]">
                      {filteredServices.map(s => (
                        <SelectItem key={s.id} value={s.id} className="min-w-0 overflow-hidden">
                          <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden">
                            <span className="text-slate-400 font-mono text-xs shrink-0">#{s.displayId}</span>
                            <span className="min-w-0 flex-1 truncate">{s.name}</span>
                            <span className="shrink-0 font-semibold text-blue-600">{formatPrice(s.customerRate)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && (
                    <div className="space-y-3">
                      <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 sm:px-4 sm:py-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-blue-600">{d.pricePerThousand}</p>
                          <p className="mt-0.5 text-xs text-slate-500">1,000 units</p>
                        </div>
                        <p className="shrink-0 text-lg font-bold text-slate-900">{formatPrice(selectedService.customerRate)}</p>
                      </div>

                      <section className="hidden rounded-xl border border-slate-200 bg-white p-4 lg:block" aria-labelledby="service-details-title">
                        <div className="mb-3 flex items-center gap-2 text-blue-600">
                          <Component className="size-4" />
                          <h3 id="service-details-title" className="text-sm font-semibold">{d.description}</h3>
                        </div>
                        <p className="text-sm font-semibold leading-relaxed text-slate-900">
                          {serviceNameParts[0] || selectedService.name}
                        </p>
                        {serviceNameParts.length > 1 && (
                          <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                            {serviceNameParts.slice(1).map((detail, index) => (
                              <li key={`${detail}-${index}`} className="flex min-w-0 gap-2 text-sm leading-relaxed text-slate-600">
                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
                                <span className="min-w-0 break-words">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {selectedService.description && selectedService.description.trim() !== selectedService.name.trim() && (
                          <p className="mt-3 whitespace-pre-wrap break-words border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                            {selectedService.description}
                          </p>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              )}

              <div className="min-w-0 space-y-2">
                <Label htmlFor="link" className="text-slate-700 font-semibold">{d.link}</Label>
                <Input 
                  id="link" 
                  name="link" 
                  type="url" 
                  placeholder={d.linkPlaceholder} 
                  required 
                  disabled={!selectedService} 
                  className="h-12 bg-slate-50 border-slate-200"
                />
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 font-semibold">{d.quantity}</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  placeholder="1000"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required 
                  disabled={!selectedService}
                  min={selectedService?.minQuantity}
                  max={selectedService?.maxQuantity}
                  className="h-12 bg-slate-50 border-slate-200"
                />
                {selectedService && (
                  <div className="mt-1 min-w-0 text-xs text-slate-500 lg:flex lg:items-start lg:justify-between lg:gap-4">
                    <span className="block min-w-0 break-words">{d.minMax.replace('{min}', selectedService.minQuantity.toLocaleString()).replace('{max}', selectedService.maxQuantity.toLocaleString())}</span>
                    <span className="hidden shrink-0 text-right lg:block">
                      <span className="block text-slate-400">{d.charge}</span>
                      <strong className="mt-0.5 block text-sm text-blue-600">{formatPrice(price)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {selectedService && (
                <details className="group rounded-xl border border-slate-200 bg-white lg:hidden">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-blue-600 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2"><Component className="size-4" />{d.description}</span>
                    <span className="text-lg leading-none text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold leading-relaxed text-slate-900">{serviceNameParts[0] || selectedService.name}</p>
                    {serviceNameParts.length > 1 && (
                      <ul className="mt-3 space-y-2">
                        {serviceNameParts.slice(1).map((detail, index) => (
                          <li key={`${detail}-${index}`} className="flex min-w-0 gap-2 text-sm leading-relaxed text-slate-600">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" />
                            <span className="min-w-0 break-words">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedService.description && selectedService.description.trim() !== selectedService.name.trim() && (
                      <p className="mt-3 whitespace-pre-wrap break-words border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">{selectedService.description}</p>
                    )}
                  </div>
                </details>
              )}

              {(state?.error || state?.success) && (
                <div className={`rounded-xl border p-3 text-sm font-medium lg:hidden ${state.error ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                  {state.error ? (state.error === 'Order failed' ? d.error : state.error) : d.success}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary & Info */}
      <div className="hidden space-y-6 lg:col-span-1 lg:block">
        <div className="sticky top-24 space-y-6">
          {selectedService ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              
              <h3 className="mb-4 text-lg font-bold text-white sm:mb-6">Order Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white font-medium text-right max-w-[180px] truncate" title={selectedService.name}>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Category</span>
                  <span className="text-white font-medium text-right">{selectedService.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Min / Max</span>
                  <span className="text-white font-medium">{selectedService.minQuantity.toLocaleString()} / {selectedService.maxQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Refill</span>
                  <span className="text-white font-medium">{selectedService.refillSupported ? '✅ Available' : '❌ None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cancel</span>
                  <span className="text-white font-medium">{selectedService.cancelSupported ? '✅ Available' : '❌ None'}</span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-slate-400">Total Charge</span>
                  <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>
                </div>

                {state?.error && (
                  <div className="text-sm text-red-400 font-medium mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    {state.error === "Order failed" ? d.error : state.error}
                  </div>
                )}
                {state?.success && (
                  <div className="text-sm text-emerald-400 font-medium mb-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    {d.success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  form="order-form"
                  disabled={pending || !orderIsValid}
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 rounded-xl"
                >
                  {pending ? 'Processing...' : d.submit}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center sm:p-10">
              <Component className="w-10 h-10 text-slate-300 mb-4" />
              <h3 className="text-slate-900 font-bold mb-1">No Service Selected</h3>
              <p className="text-slate-500 text-sm">Select a category and service to see your order summary here.</p>
            </div>
          )}

        </div>
      </div>

      {selectedService && (
        <div className="fixed left-3 right-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 flex min-w-0 max-w-[calc(100vw-1.5rem)] items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_40px_rgba(15,23,42,0.20)] backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1 pl-1">
            <p className="text-xs text-slate-500">{d.charge}</p>
            <p className="truncate text-xl font-bold text-slate-900">{formatPrice(price)}</p>
          </div>
          <Button
            type="submit"
            form="order-form"
            disabled={pending || !orderIsValid}
            className="h-11 max-w-[58%] shrink-0 truncate rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500"
          >
            {pending ? 'Processing...' : d.submit}
          </Button>
        </div>
      )}
    </div>
  </div>
  )
}
