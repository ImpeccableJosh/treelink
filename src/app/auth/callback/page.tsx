"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  useEffect(() => {
    async function finishSignIn() {
      const supabase = createClient()

      // Complete the sign-in flow from URL (magic link / OAuth). This
      // extracts session from the URL fragment and returns session tokens.
  // `getSessionFromUrl` may not be typed on the auth client in this
  // workspace's Supabase helper types, so use `any` to call it.
  const { data, error } = await (supabase.auth as any).getSessionFromUrl?.({ storeSession: false }) || {}

      if (error) {
        // If there's an error, redirect to signin page
        router.replace('/signin')
        return
      }

      const session = data?.session
      if (!session) {
        router.replace('/signin')
        return
      }

      // Send tokens to the server to set secure, HTTP-only cookies for SSR
      const redirectTo = new URL(window.location.href).searchParams.get('redirect') || '/dashboard'
      await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          redirect: redirectTo,
        }),
      })

      // Server will respond with a redirect; client follow
      // Use replace to avoid leaving callback URL in history
      router.replace(redirectTo)
    }

    finishSignIn()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  )
}
