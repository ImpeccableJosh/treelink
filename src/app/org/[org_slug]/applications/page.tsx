import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { ApplicationsTable } from '@/components/org/ApplicationsTable'
import { Card } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ org_slug: string }>
  searchParams: Promise<{ status?: string; type?: string }>
}

export default async function ApplicationsPage({ params, searchParams }: PageProps) {
  const { org_slug } = await params
  const { status, type } = await searchParams
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
  
  // Get applications
  const applicationsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/applications?organization_id=${org.id}${status ? `&status=${status}` : ''}${type ? `&application_type_id=${type}` : ''}`,
    {
      cache: 'no-store',
    }
  )
  
  const { data: applications } = await applicationsResponse.json()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
      </div>
      
      <Card>
        <ApplicationsTable applications={applications || []} />
      </Card>
    </div>
  )
}

