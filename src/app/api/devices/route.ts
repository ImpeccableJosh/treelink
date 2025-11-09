import { NextRequest, NextResponse } from 'next/server'
import { requireOrgAccess } from '@/lib/auth/helpers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDeviceSecret } from '@/lib/utils/tokens'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }
    
    await requireOrgAccess(organizationId)
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('reader_devices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Don't return device_secret in list
    const safeData = data?.map((device: any) => {
      const { device_secret, ...safe } = device
      return safe
    })
    
    return NextResponse.json({ data: safeData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization_id, name, metadata } = body
    
    if (!organization_id || !name) {
      return NextResponse.json({ error: 'organization_id and name are required' }, { status: 400 })
    }
    
    await requireOrgAccess(organization_id, 'admin')
    
    const deviceSecret = generateDeviceSecret()
    const supabase = await createServiceClient()
    
    const { data, error } = await supabase
      .from('reader_devices')
      .insert({
        organization_id,
        name,
        device_secret: deviceSecret,
        metadata: metadata || {},
        is_active: true,
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Return device with secret (only shown once)
    return NextResponse.json({
      data: {
        id: data.id,
        name: data.name,
        organization_id: data.organization_id,
        is_active: data.is_active,
        created_at: data.created_at,
      },
      secret: deviceSecret, // Show this once
      warning: 'Save this secret now. It will not be shown again.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

