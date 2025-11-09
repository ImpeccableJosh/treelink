import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ org_slug: string }>
}

export default async function AnalyticsPage({ params }: PageProps) {
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
  
  // Get analytics
  const analyticsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/analytics?organization_id=${org.id}`,
    {
      cache: 'no-store',
    }
  )
  
  const { data: analytics } = await analyticsResponse.json()
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.data?.total_applications || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-[#10B981]">
                {analytics?.data?.completion_rate || 0}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Breakdown</h2>
          <div className="space-y-2">
            {analytics?.data?.status_breakdown && Object.entries(analytics.data.status_breakdown).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scans Over Time</h2>
        <p className="text-gray-600">Chart visualization coming soon...</p>
        <div className="mt-4 space-y-2">
          {analytics?.data?.scans_by_day && Object.entries(analytics.data.scans_by_day).map(([day, count]) => (
            <div key={day} className="flex justify-between text-sm">
              <span className="text-gray-600">{day}</span>
              <span className="font-medium text-gray-900">{count as number} scans</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

