import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't need auth
  if (
    pathname.startsWith('/api/nfc/scan') ||
    pathname.match(/^\/[a-f0-9-]{36}$/) || // Card UUIDs
    pathname.startsWith('/apply/complete') ||
    pathname.startsWith('/signin/')
  ) {
    return await updateSession(request)
  }
  
  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/org/')) {
    return await updateSession(request)
  }
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

