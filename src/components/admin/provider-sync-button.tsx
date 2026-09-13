'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncServices } from '@/lib/actions/sync'
import { RefreshCw } from 'lucide-react'

export function ProviderSyncButton({ providerId }: { providerId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await syncServices(providerId)
      if (res.success) {
        setResult(`Success: ${res.message}`)
      } else {
        setResult(`Error: ${res.message}`)
      }
    } catch (err: any) {
      setResult(`Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleSync} disabled={loading} size="sm" variant="outline">
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Syncing...' : 'Sync Services'}
      </Button>
      {result && <span className="text-xs text-slate-600">{result}</span>}
    </div>
  )
}
