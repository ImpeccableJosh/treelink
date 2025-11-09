import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', user.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data: data?.map((m: any) => ({ ...m.organizations, role: m.role })) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, slug, description, email, website } = body
    
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        description,
        email,
        website,
        created_by: user.id,
      })
      .select()
      .single()
    
    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }
    
    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })
    
    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
    
    return NextResponse.json({ data: org })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

