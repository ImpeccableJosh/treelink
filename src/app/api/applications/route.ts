import { NextRequest, NextResponse } from 'next/server'
import { getOrgApplications } from '@/lib/db/queries'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }
    
    // Verify user is org member
    const supabase = await createClient()
    const { data: member } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!member) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }
    
    const filters = {
      status: searchParams.get('status') || undefined,
      application_type_id: searchParams.get('application_type_id') || undefined,
      startDate: searchParams.get('start_date') || undefined,
      endDate: searchParams.get('end_date') || undefined,
    }
    
    const { data, error } = await getOrgApplications(organizationId, filters)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

