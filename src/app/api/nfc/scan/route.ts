import { NextRequest, NextResponse } from 'next/server'
import { getDeviceBySecret, createApplication, recordAnalyticsEvent } from '@/lib/db/queries'
import { getUserByCardUuid } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }
    
    const deviceSecret = authHeader.substring(7)
    const body = await request.json()
    const { card_uuid, reader_id, application_type_id } = body
    
    if (!card_uuid || !reader_id) {
      return NextResponse.json({ error: 'Missing required fields: card_uuid, reader_id' }, { status: 400 })
    }
    
    // Validate device
    const { data: device, error: deviceError } = await getDeviceBySecret(deviceSecret)
    if (deviceError || !device || device.id !== reader_id) {
      return NextResponse.json({ error: 'Invalid device credentials' }, { status: 403 })
    }
    
    if (!device.is_active) {
      return NextResponse.json({ error: 'Device is not active' }, { status: 403 })
    }
    
    // Lookup user by card_uuid
    const { data: user, error: userError } = await getUserByCardUuid(card_uuid)
    if (userError || !user) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    
    // Check for duplicate pending application (within 24 hours)
    // This would require an additional query - simplified for now
    // In production, add deduplication logic here
    
    // Create application
    const { data: application, error: appError, publicToken } = await createApplication({
      user_id: user.id,
      card_uuid: card_uuid,
      organization_id: device.organization_id,
      reader_device_id: device.id,
      application_type_id: application_type_id || null,
    })
    
    if (appError || !application) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
    }
    
    // Record analytics event
    await recordAnalyticsEvent({
      organization_id: device.organization_id,
      user_id: user.id,
      application_id: application.id,
      event_type: 'scan',
      metadata: { reader_device_id: device.id },
    })
    
    // Send email notification (would integrate with email service here)
    // For now, we'll just return success
    // In production, add email sending logic:
    // await sendApplicationEmail(user.email, publicToken, application.id)
    
    // Update device last_seen_at
    // This would require an update query - simplified for now
    
    return NextResponse.json({
      success: true,
      application_id: application.id,
      // Don't return publicToken to device for security
    }, { status: 201 })
  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

