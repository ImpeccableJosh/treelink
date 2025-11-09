import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { getSession } from '@/lib/auth/helpers'
import { createServiceClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface PageProps {
  params: Promise<{ org_slug: string }>
}

export default async function OrgDashboardPage({ params }: PageProps) {
  const { org_slug } = await params
  // Use service-role client for server-side reads so we don't depend on
  // browser cookies being present for RLS. This is safe because this code
  // runs only on the server.
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
  
  // Get member role
  const memberResult: any = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  const member = memberResult?.data as any
  const memberError = memberResult?.error

  if (memberError || !member) {
    // If membership missing it could be: user not a member, or DB referential
    // mismatch (org members stored against auth.users vs public/users). Redirect.
    redirect('/dashboard?error=NotAMember')
  }
  
  if (!member) {
    redirect('/dashboard?error=non-member')
  }
  
  // Get quick stats
  const { count: totalApplications } = await supabase
    .from('informal_applications')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
  
  const { count: completedApplications } = await supabase
    .from('informal_applications')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('status', 'completed')
  
  const { count: activeDevices } = await supabase
    .from('reader_devices')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('is_active', true)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
          {org.description && (
            <p className="text-gray-600 mt-2">{org.description}</p>
          )}
        </div>
        <Badge variant={member.role === 'owner' ? 'success' : 'default'}>
          {member.role}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{totalApplications || 0}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-[#10B981]">{completedApplications || 0}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Active Devices</p>
            <p className="text-3xl font-bold text-[#4ECDC4]">{activeDevices || 0}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href={`/org/${org_slug}/applications`}>
              <Button variant="secondary" className="w-full">
                View Applications
              </Button>
            </Link>
            <Link href={`/org/${org_slug}/devices`}>
              <Button variant="secondary" className="w-full">
                Manage Devices
              </Button>
            </Link>
            <Link href={`/org/${org_slug}/analytics`}>
              <Button variant="secondary" className="w-full">
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity feed coming soon...</p>
        </Card>
      </div>
    </div>
  )
}

