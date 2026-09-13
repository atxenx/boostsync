'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProvider, deleteProvider, testProviderConnection, updateProvider } from '@/lib/actions/provider'
import { syncServices } from '@/lib/actions/sync'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, RefreshCw, Wifi, WifiOff, Pencil, X, Check, 
  Loader2, Server, ExternalLink, Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ─── Add Provider Form ───────────────────────────────────
export function AddProviderForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [markupType, setMarkupType] = useState('PERCENTAGE')
  const [markupValue, setMarkupValue] = useState('30')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await createProvider(name, apiUrl, apiKey, markupType, parseFloat(markupValue))
    setLoading(false)
    if (res.success) {
      setOpen(false)
      setName('')
      setApiUrl('')
      setApiKey('')
      setMarkupType('PERCENTAGE')
      setMarkupValue('30')
      router.refresh()
    } else {
      setError(res.error || 'Failed to create provider')
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20">
        <Plus className="w-4 h-4 mr-2" /> Add Provider
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Add New Provider</h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">Provider Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. SMMKings" required className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">API URL</Label>
            <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://example.com/api/v2" type="url" required className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">API Key</Label>
            <Input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Your API key" type="password" required className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold text-sm">Default Markup</Label>
            <div className="flex gap-2">
              <select 
                value={markupType} 
                onChange={e => setMarkupType(e.target.value)}
                className="flex h-10 w-2/5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed (฿)</option>
              </select>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                value={markupValue} 
                onChange={e => setMarkupValue(e.target.value)} 
                required 
                className="bg-slate-50 w-3/5" 
              />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4 mr-2" /> Create Provider</>}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
        </div>
      </form>
    </div>
  )
}

// ─── Provider Card ───────────────────────────────────────
interface ProviderCardProps {
  provider: {
    id: string
    name: string
    apiUrl: string
    active: boolean
    encryptedApiKey: string | null
    defaultMarkupType: string
    defaultMarkupValue: number
    createdAt: Date
    _count?: { services: number }
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const router = useRouter()
  const [balance, setBalance] = useState<string | null>(null)
  const [currency, setCurrency] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(provider.name)
  const [editUrl, setEditUrl] = useState(provider.apiUrl)
  const [editKey, setEditKey] = useState('')
  const [editActive, setEditActive] = useState(provider.active)
  const [editMarkupType, setEditMarkupType] = useState(provider.defaultMarkupType || 'PERCENTAGE')
  const [editMarkupValue, setEditMarkupValue] = useState(provider.defaultMarkupValue?.toString() || '30')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleToggleActive() {
    if (toggling) return
    setToggling(true)
    const res = await updateProvider(provider.id, provider.name, provider.apiUrl, '', !provider.active, provider.defaultMarkupType, provider.defaultMarkupValue)
    setToggling(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || 'Failed to toggle provider')
    }
  }

  async function handleTestConnection() {
    setConnectionStatus('loading')
    setConnectionError('')
    const res = await testProviderConnection(provider.id)
    if (res.success) {
      setConnectionStatus('success')
      setBalance(res.balance || '0')
      setCurrency(res.currency || 'THB')
    } else {
      setConnectionStatus('error')
      setConnectionError(res.error || 'Connection failed')
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult('')
    const res = await syncServices(provider.id)
    setSyncing(false)
    setSyncResult(res.message || '')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete provider "${provider.name}" and all its services? This cannot be undone.`)) return
    setDeleting(true)
    await deleteProvider(provider.id)
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    const res = await updateProvider(provider.id, editName, editUrl, editKey, editActive, editMarkupType, parseFloat(editMarkupValue))
    setSaving(false)
    if (res.success) {
      setEditing(false)
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider.active ? 'bg-blue-50' : 'bg-slate-100'}`}>
              <Server className={`w-6 h-6 ${provider.active ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
            <div>
              {editing ? (
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-lg font-bold mb-1" />
              ) : (
                <h3 className="text-lg font-bold text-slate-900">{provider.name}</h3>
              )}
              {editing ? (
                <Input value={editUrl} onChange={e => setEditUrl(e.target.value)} className="h-7 text-xs font-mono mt-1" />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-500 truncate max-w-[300px]">{provider.apiUrl}</span>
                  <a href={provider.apiUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 border ${
                provider.active ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-300'
              }`}
              title={provider.active ? "Disable provider" : "Enable provider"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform ${
                  provider.active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <Badge className={provider.active ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-slate-100 text-slate-500 border-none'}>
              {provider.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {editing && (
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">New API Key (leave blank to keep current)</Label>
              <Input value={editKey} onChange={e => setEditKey(e.target.value)} type="password" placeholder="••••••••" className="h-8 bg-slate-50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Default Markup for New Services</Label>
              <div className="flex gap-2">
                <select 
                  value={editMarkupType} 
                  onChange={e => setEditMarkupType(e.target.value)}
                  className="flex h-8 w-32 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed (฿)</option>
                </select>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={editMarkupValue} 
                  onChange={e => setEditMarkupValue(e.target.value)} 
                  className="h-8 bg-slate-50 w-24" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} className="rounded" />
                Provider is active
              </label>
            </div>
          </div>
        )}

        {/* Balance / Connection Status */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <Wifi className="w-4 h-4" />
              Connected · Balance: {currency} {balance}
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium">
              <WifiOff className="w-4 h-4" />
              {connectionError}
            </div>
          )}
          {syncResult && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
              {syncResult}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <Button 
          variant="outline" size="sm" onClick={handleTestConnection} 
          disabled={connectionStatus === 'loading'}
          className="rounded-full text-xs"
        >
          {connectionStatus === 'loading' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Wifi className="w-3 h-3 mr-1.5" />}
          Test Connection
        </Button>
        <Button 
          variant="outline" size="sm" onClick={handleSync} disabled={syncing}
          className="rounded-full text-xs"
        >
          {syncing ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1.5" />}
          Sync Services
        </Button>

        <div className="flex-1" />

        {editing ? (
          <>
            <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-full text-xs bg-blue-600 text-white">
              {saving ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Check className="w-3 h-3 mr-1.5" />}
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="rounded-full text-xs">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-full text-xs">
              <Pencil className="w-3 h-3 mr-1.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="rounded-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
              {deleting ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1.5" />}
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
