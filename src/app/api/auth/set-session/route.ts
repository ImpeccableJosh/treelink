import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { access_token, refresh_token, redirect } = body

    const redirectUrl = redirect && typeof redirect === 'string' && redirect.startsWith('/')
      ? `${request.nextUrl.origin}${redirect}`
      : `${request.nextUrl.origin}/dashboard`

    // Prepare response we can attach cookies to
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Attach cookies to the response so browser receives them
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            response.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Set session on the server-side client; this will invoke our `set` above
    const { error } = await (supabase.auth as any).setSession({ access_token, refresh_token })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
