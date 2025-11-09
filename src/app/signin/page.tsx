import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/helpers'
import { SignInForm } from '@/components/auth/SignInForm'

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { redirect: redirectTo } = await searchParams
  
  // Check if user is already signed in
  const session = await getSession()
  if (session) {
    if (redirectTo) {
      redirect(decodeURIComponent(redirectTo))
    } else {
      redirect('/dashboard')
    }
  }
  
  const finalRedirect = redirectTo 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?redirect=${encodeURIComponent(decodeURIComponent(redirectTo))}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#A8E6CF] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">
            Enter your email to receive a magic link and sign in.
          </p>
        </div>
        
        <SignInForm redirectTo={finalRedirect} />
      </div>
    </div>
  )
}

