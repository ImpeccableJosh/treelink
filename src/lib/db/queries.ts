import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generatePublicToken } from '@/lib/utils/tokens'

export async function getUserByCardUuid(cardUuid: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('card_uuid', cardUuid)
    .single()
  
  return { data, error }
}

export async function getUserBySignupToken(token: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('signup_token', token)
    .single()
  
  return { data, error }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userId)
    .single()
  
  return { data, error }
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('auth_user_id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function linkUserToAuth(userId: string, authUserId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function getDeviceBySecret(deviceSecret: string) {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('reader_devices')
    .select('*, organization_id')
    .eq('device_secret', deviceSecret)
    .eq('is_active', true)
    .single()
  
  return { data, error }
}

export async function createApplication(applicationData: {
  user_id: string
  card_uuid: string
  organization_id: string
  reader_device_id: string
  application_type_id?: string
}) {
  const supabase = await createServiceClient()
  
  const publicToken = generatePublicToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now
  
  const { data, error } = await supabase
    .from('informal_applications')
    .insert({
      ...applicationData,
      public_token: publicToken,
      token_expires_at: expiresAt.toISOString(),
      status: 'awaiting_user',
    } as any)
    .select()
    .single()
  
  return { data, error, publicToken }
}

export async function getApplicationByToken(token: string) {
  // Use service client to bypass RLS for public token access
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('informal_applications')
    .select(`
      *
    `)
    .eq('public_token', token)
    .single()
  
  return { data, error }
}

export async function completeApplication(applicationId: string, payload: any) {
  // Use service client to bypass RLS for token-based completion
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('informal_applications')
    .update({
      payload,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select()
    .single()
  
  return { data, error }
}

export async function getOrgApplications(organizationId: string, filters?: {
  status?: string
  application_type_id?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('informal_applications')
    .select(`
      *,
      users (id, first_name, last_name, email, card_uuid),
      application_types (id, title, slug)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.application_type_id) {
    query = query.eq('application_type_id', filters.application_type_id)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  const { data, error } = await query
  
  return { data, error }
}

export async function recordAnalyticsEvent(eventData: {
  organization_id?: string
  user_id?: string
  application_id?: string
  event_type: string
  metadata?: any
}) {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      ...eventData,
      metadata: eventData.metadata || {},
    } as any)
    .select()
    .single()
  
  return { data, error }
}

