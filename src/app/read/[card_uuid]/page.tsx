import { notFound } from 'next/navigation'
import { getUserByCardUuid } from '@/lib/db/queries'
import { CardProfile } from '@/components/card/CardProfile'
import { isValidUUID } from '@/lib/utils/tokens'

interface PageProps {
  params: Promise<{ card_uuid: string }>
}

export default async function ReadPage({ params }: PageProps) {
  const { card_uuid } = await params
  
  // Validate UUID format
  if (!isValidUUID(card_uuid)) {
    notFound()
  }
  
  const { data: user, error } = await getUserByCardUuid(card_uuid)
  
  if (error || !user) {
    notFound()
  }
const response = await fetch(`${process.env.APP_URL || 'http://10.32.127.194:3000'}/api/nfc/scan`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 182e65af-eb9d-4d28-9d5f-e52b50d5ef69`
    },
    body: JSON.stringify({
        card_uuid,
        reader_id: '1b14bfd3-5065-4a34-a2b5-0e3699e1f3fe'
    }),
    cache: 'no-store'
})

const result = await response.json()
const applicationId = result.application_id
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A8E6CF] to-white py-8 px-4">
      <CardProfile user={user} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { card_uuid } = await params
  const { data: user } = await getUserByCardUuid(card_uuid)
  
  if (!user) {
    return {
      title: 'Card Not Found',
    }
  }
  
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Contact'
  
  return {
    title: `${fullName} - Digital Card`,
    description: user.tagline || user.bio || `Digital card for ${fullName}`,
  }
}

