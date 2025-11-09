import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/db/queries'
import { requireAuth } from '@/lib/auth/helpers'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function DashboardPage() {
  const user = await requireAuth()
  const { data: profile } = await getUserProfile(user.id)
  
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found. Please contact support.</p>
      </div>
    )
  }
  
  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${profile.card_uuid}`
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Public Card</h2>
          <p className="text-gray-600 mb-4">
            Share this link with others to view your digital card:
          </p>
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm text-gray-800 break-all">{cardUrl}</code>
            <Link
              href={cardUrl}
              target="_blank"
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
        <ProfileEditor initialProfile={profile} />
      </Card>
    </div>
  )
}

