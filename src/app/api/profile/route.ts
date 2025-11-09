import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { getUserProfile, updateUserProfile } from '@/lib/db/queries'

export async function GET() {
  try {
    const user = await requireAuth()
    const { data, error } = await getUserProfile(user.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const { data, error } = await updateUserProfile(user.id, {
      first_name: body.first_name,
      last_name: body.last_name,
      title: body.title,
      tagline: body.tagline,
      bio: body.bio,
      linkedin: body.linkedin,
      instagram: body.instagram,
      github: body.github,
      website: body.website,
      avatar_url: body.avatar_url,
      email: body.email,
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

