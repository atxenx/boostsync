import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditProviderForm } from '@/components/admin/edit-provider-form'

export default async function EditProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const provider = await db.provider.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!provider) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Provider Settings</h1>
      <EditProviderForm provider={provider} />
    </div>
  )
}
