import { NextRequest, NextResponse } from 'next/server'
import { getApplicationByToken, completeApplication, recordAnalyticsEvent } from '@/lib/db/queries'
import { requireAuth } from '@/lib/auth/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { payload, token } = body
    
    // Validate token if provided (for unauthenticated completion)
    if (token) {
      const { data: application } = await getApplicationByToken(token)
      const app = application as any
      if (!app || app.id !== id) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
      }
      
      if (app.token_expires_at && new Date(app.token_expires_at) < new Date()) {
        return NextResponse.json({ error: 'Token expired' }, { status: 403 })
      }
      
      if (app.status === 'completed') {
        return NextResponse.json({ error: 'Application already completed' }, { status: 400 })
      }
    } else {
      // Require auth if no token
      const user = await requireAuth()
      const { data: application } = await getApplicationByToken('') // Would need to fetch by ID
      const app = application as any
      if (!app || app.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    const { data, error } = await completeApplication(id, payload)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Record analytics
    const appData = data as any
    await recordAnalyticsEvent({
      organization_id: appData.organization_id,
      user_id: appData.user_id,
      application_id: appData.id,
      event_type: 'application_completed',
    })
    
    // Send confirmation email to org (would integrate email service here)
    
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

