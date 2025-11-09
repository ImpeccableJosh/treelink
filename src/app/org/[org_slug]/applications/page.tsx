import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/helpers'
import { ApplicationsTable } from '@/components/org/ApplicationsTable'
import { Card } from '@/components/ui/Card'

interface PageProps {
  params: Promise<{ org_slug: string }>
  searchParams: Promise<{ status?: string; type?: string }>
}

export default async function ApplicationsPage({ params, searchParams }: PageProps) {
  const { org_slug } = await params
  const { status, type } = await searchParams
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
  
  // // Get applications
  // const applicationsResponse = await fetch(
  //   `${process.env.NEXT_PUBLIC_APP_URL}/api/applications?organization_id=${org.id}${status ? `&status=${status}` : ''}${type ? `&application_type_id=${type}` : ''}`,
  //   {
  //     cache: 'no-store',
  //   }
  // )
  
  // const { data: applications } = await applicationsResponse.json()
  // Fetch applications directly here to avoid an extra HTTP request
  let query = supabase
    .from('informal_applications')
    .select(`
      *,
      users (id, first_name, last_name, email, card_uuid),
      application_types (id, title, slug)
    `)
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })
  const { data: applications, error } = await query

  
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

