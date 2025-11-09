import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/helpers'
import { Card } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ org_slug: string }>
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { org_slug } = await params
  const supabase = await createServiceClient()
      
      // Check auth
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser()
    
      // const user = await requireAuth(org_slug)
    
      // Require the user to be authenticated. Using getSession lets us read the
      // current session if cookies are present; if not, redirect to signin with
      // the org path so the user returns here after signing in.
      const session = await getSession()
      if (!session) {
        redirect(`/signin?redirect=${encodeURIComponent(`/org/${org_slug}`)}`)
      }
      const user = session!.user
      
      // Get organization
      // Fetch organization and membership with the service client (bypass RLS).
      const orgResult: any = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', org_slug)
        .single()
    
      const org = orgResult?.data as any
      const orgError = orgResult?.error
    
      if (orgError || !org) {
        // Possible DB issues: slug does not exist, or select blocked by RLS if
        // using anon client. Redirect to dashboard with error.
        redirect('/dashboard?error=OrganizationNotFound')
      }
      
      if (!org) {
        redirect('/dashboard?error=Organizationnotfound')
      }
  
  // Get analytics
  
  
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

