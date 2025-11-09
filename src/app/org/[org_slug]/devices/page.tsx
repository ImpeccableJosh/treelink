import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { DeviceList } from '@/components/org/DeviceList'
import { Card } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ org_slug: string }>
}

export default async function DevicesPage({ params }: PageProps) {
  const { org_slug } = await params
  const user = await requireAuth()
  const supabase = await createClient()
  
  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', org_slug)
    .single()
  
  if (!org) {
    redirect('/dashboard')
  }
  
  // Get devices
  const devicesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/devices?organization_id=${org.id}`,
    {
      cache: 'no-store',
    }
  )
  
  const { data: devices } = await devicesResponse.json()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
      </div>
      
      <Card>
        <DeviceList organizationId={org.id} devices={devices || []} />
      </Card>
    </div>
  )
}

