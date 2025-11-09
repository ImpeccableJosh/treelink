import { NextRequest, NextResponse } from 'next/server'
import { requireOrgAccess } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }
    
    await requireOrgAccess(organizationId)
    const supabase = await createClient()
    
    // Get basic metrics
    let applicationsQuery = supabase
      .from('informal_applications')
      .select('id, status, created_at', { count: 'exact' })
      .eq('organization_id', organizationId)
    
    if (startDate) {
      applicationsQuery = applicationsQuery.gte('created_at', startDate)
    }
    if (endDate) {
      applicationsQuery = applicationsQuery.lte('created_at', endDate)
    }
    
    const { data: applications, count: totalApplications } = await applicationsQuery
    
    // Get status breakdown
    const statusCounts = {
      pending: 0,
      awaiting_user: 0,
      completed: 0,
      expired: 0,
      closed: 0,
    }
    
    applications?.forEach((app: any) => {
      if (app.status in statusCounts) {
        statusCounts[app.status as keyof typeof statusCounts]++
      }
    })
    
    // Get scans by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentScans } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('organization_id', organizationId)
      .eq('event_type', 'scan')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })
    
    // Group by day
    const scansByDay: Record<string, number> = {}
    recentScans?.forEach((event: any) => {
      const day = new Date(event.created_at).toISOString().split('T')[0]
      scansByDay[day] = (scansByDay[day] || 0) + 1
    })
    
    return NextResponse.json({
      data: {
        total_applications: totalApplications || 0,
        status_breakdown: statusCounts,
        completion_rate: totalApplications
          ? ((statusCounts.completed / totalApplications) * 100).toFixed(1)
          : '0',
        scans_by_day: scansByDay,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

