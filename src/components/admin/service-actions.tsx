'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Power, DollarSign, X, Loader2, Sparkles, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateService } from '@/lib/actions/service'
import { rewriteServiceName } from '@/lib/actions/ai'
import { cn } from '@/lib/utils'

interface ServiceActionButtonsProps {
  serviceId: string
  name: string
  category: string
  hidden: boolean
  active: boolean
  markupType: string
  markupValue: number
  providerRate: number
  customerRate: number
}

export function ServiceActionButtons({
  serviceId,
  name,
  category,
  hidden,
  active,
  markupType,
  markupValue,
  providerRate,
  customerRate,
}: ServiceActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isEditingRate, setIsEditingRate] = useState(false)
  
  const [editName, setEditName] = useState(name || '')
  const [editCategory, setEditCategory] = useState(category || '')
  const [editMarkupType, setEditMarkupType] = useState(markupType)
  const [editMarkupValue, setEditMarkupValue] = useState(markupValue.toString())

  async function handleToggleVisibility() {
    setIsLoading(true)
    try {
      await updateService(serviceId, { hidden: !hidden })
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleActive() {
    setIsLoading(true)
    try {
      await updateService(serviceId, { active: !active })
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveRate(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateService(serviceId, { 
        name: editName,
        category: editCategory,
        markupType: editMarkupType, 
        markupValue: parseFloat(editMarkupValue) 
      })
      setIsEditingRate(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRewriteName() {
    setIsAiLoading(true)
    try {
      const res = await rewriteServiceName(editName, editCategory)
      if (res.success && res.data) {
        setEditName(res.data)
      } else {
        alert('AI Failed: ' + res.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditingRate(true)}
          disabled={isLoading}
          title="Edit Service"
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleVisibility}
          disabled={isLoading}
          title={hidden ? "Show Service" : "Hide Service"}
          className={cn(hidden ? "text-slate-400" : "text-slate-700")}
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleActive}
          disabled={isLoading}
          title={active ? "Deactivate Service" : "Activate Service"}
          className={cn(active ? "text-green-600" : "text-red-600")}
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>

      {isEditingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Service
              </h3>
              <button type="button" onClick={() => setIsEditingRate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveRate} className="p-4 space-y-4 text-left">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Service Category</Label>
                <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Service Name</Label>
                <div className="flex gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} required className="flex-1" />
                  <Button type="button" variant="outline" onClick={handleRewriteName} disabled={isAiLoading} title="Rewrite with AI" className="flex gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    AI Fix
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-sm">
                <span className="text-slate-500">Provider Cost:</span>
                <span className="font-mono text-slate-900">฿{providerRate.toFixed(3)}</span>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Markup Configuration (Profit)</Label>
                <div className="flex gap-2">
                  <select
                    value={editMarkupType}
                    onChange={(e) => setEditMarkupType(e.target.value)}
                    className="flex h-10 w-1/3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (฿)</option>
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editMarkupValue}
                    onChange={(e) => setEditMarkupValue(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditingRate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
