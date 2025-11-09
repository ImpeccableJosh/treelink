import { notFound, redirect } from 'next/navigation'
import { getApplicationByToken } from '@/lib/db/queries'
import { ApplicationForm } from '@/components/apply/ApplicationForm'
import { getSession } from '@/lib/auth/helpers'
import { Card } from '@/components/ui/Card'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function CompleteApplicationPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  
  if (!token) {
    notFound()
  }
  
  const { data: application, error } = await getApplicationByToken(token)
  
  if (error) {
    console.error('Error fetching application:', error)
    // In development, show the error for debugging
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-2">Error: {error.message}</p>
            <p className="text-sm text-gray-500">Token: {token.substring(0, 20)}...</p>
          </Card>
        </div>
      )
    }
    notFound()
  }
  
  if (!application) {
    notFound()
  }
  
  const app = application as any
  
  // Check if expired
  if (app.token_expires_at && new Date(app.token_expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This application link has expired. Please contact the organization for a new link.
          </p>
        </Card>
      </div>
    )
  }
  
  // Check if already completed
  if (app.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Completed</h1>
          <p className="text-gray-600">
            You have already completed this application. Thank you!
          </p>
        </Card>
      </div>
    )
  }
  
  const session = await getSession()
  const isOwner = session?.user?.id === app.user_id
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A8E6CF] to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Application
            </h1>
            <p className="text-gray-600">
              {app.organizations && typeof app.organizations === 'object' && 'name' in app.organizations
                ? `${(app.organizations as any).name} scanned your card. Complete your application below.`
                : 'Complete your application below.'}
            </p>
          </div>
          
          <ApplicationForm
            application={app}
            isAuthenticated={!!session}
            isOwner={isOwner}
          />
        </Card>
      </div>
    </div>
  )
}

