'use client'

import { useState, useActionState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateProvider } from '@/lib/actions/provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function EditProviderForm({ provider }: { provider: any }) {
  const router = useRouter()
  
  const [name, setName] = useState(provider.name)
  const [apiUrl, setApiUrl] = useState(provider.apiUrl)
  const [apiKey, setApiKey] = useState('')
  const [active, setActive] = useState(provider.active)
  
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await updateProvider(provider.id, name, apiUrl, apiKey, active)
      return res
    },
    null
  )

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/providers')
      router.refresh()
    }
  }, [state, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Provider</CardTitle>
        <CardDescription>Update the connection details for this SMM provider.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Provider Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} type="url" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (Leave blank to keep current key)</Label>
            <Input id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="••••••••••••••••" />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="active" 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="active" className="cursor-pointer">Provider is Active</Label>
          </div>

          {state?.error && (
            <div className="text-sm text-red-500 font-medium">
              {state.error}
            </div>
          )}

          <div className="flex justify-between gap-4">
            <Link href="/admin/providers" className={cn(buttonVariants({ variant: "outline" }))}>
              Cancel
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
