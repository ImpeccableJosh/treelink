import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/helpers'
import { getUploadToken } from '@/lib/imagekit/client'

export async function GET() {
  try {
    await requireAuth()
    const token = getUploadToken()
    return NextResponse.json(token)
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

