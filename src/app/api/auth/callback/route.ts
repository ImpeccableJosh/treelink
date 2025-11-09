import { createClient } from '@/lib/supabase/server'
import { linkUserToAuth, getUserBySignupToken } from '@/lib/db/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const redirect = requestUrl.searchParams.get('redirect')
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${error.message}`)
    }
    
    // If token is provided, link the user to the card
    if (token) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: cardUser } = await getUserBySignupToken(token)
        if (cardUser && !cardUser.auth_user_id) {
          await linkUserToAuth(cardUser.id, authUser.id)
        }
      }
    }
    
    // Redirect to specified destination or dashboard
    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect)
      // Ensure it's a relative path for security
      if (decodedRedirect.startsWith('/')) {
        return NextResponse.redirect(`${requestUrl.origin}${decodedRedirect}`)
      }
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }
  
  return NextResponse.redirect(`${requestUrl.origin}/signin`)
}

