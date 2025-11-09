import { notFound, redirect } from 'next/navigation'
import { getUserBySignupToken } from '@/lib/db/queries'
import { SignInForm } from '@/components/auth/SignInForm'
import { getSession } from '@/lib/auth/helpers'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function SignInPage({ params }: PageProps) {
  const { token } = await params
  
  // Check if user is already signed in
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }
  
  const { data: user, error } = await getUserBySignupToken(token)
  
  if (error || !user) {
    notFound()
  }
  
  // Check if already claimed
  if (user.auth_user_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Card Already Claimed</h1>
          <p className="text-gray-600 mb-6">
            This card has already been claimed. Please sign in to access your dashboard.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-[#4ECDC4] text-white rounded-lg font-medium hover:bg-[#3AB5AD] transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }
  
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?token=${token}`
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#A8E6CF] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Your Card</h1>
          <p className="text-gray-600">
            Enter your email to receive a magic link and claim your digital card.
          </p>
        </div>
        
        <SignInForm token={token} redirectTo={redirectTo} />
      </div>
    </div>
  )
}

