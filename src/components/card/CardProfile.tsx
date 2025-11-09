import Image from 'next/image'
import { SocialLink } from './SocialLink'
import { VCardDownload } from './VCardDownload'
import { getImageUrl } from '@/lib/imagekit/client'

interface CardProfileProps {
  user: {
    first_name?: string | null
    last_name?: string | null
    title?: string | null
    tagline?: string | null
    bio?: string | null
    avatar_url?: string | null
    linkedin?: string | null
    instagram?: string | null
    github?: string | null
    website?: string | null
    email?: string | null
  }
}

export function CardProfile({ user }: CardProfileProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Contact'
  const avatarUrl = user.avatar_url ? getImageUrl(user.avatar_url, 'w-200,h-200,c-fill') : null
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
        {/* Avatar */}
        <div className="flex justify-center">
          {avatarUrl ? (
            <div className="relative w-32 h-32 rounded-full border-4 border-[#4ECDC4] overflow-hidden">
              <Image
                src={avatarUrl}
                alt={fullName}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-[#4ECDC4] bg-[#A8E6CF] flex items-center justify-center">
              <span className="text-4xl font-bold text-[#2A9D8F]">
                {user.first_name?.[0]?.toUpperCase() || user.last_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        
        {/* Name & Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{fullName}</h1>
          {user.title && (
            <p className="text-xl text-gray-600">{user.title}</p>
          )}
          {user.tagline && (
            <p className="text-lg text-gray-500">{user.tagline}</p>
          )}
        </div>
        
        {/* Bio */}
        {user.bio && (
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>
        )}
        
        {/* Social Links */}
        <div className="space-y-3">
          {user.linkedin && (
            <SocialLink type="linkedin" url={user.linkedin} />
          )}
          {user.instagram && (
            <SocialLink type="instagram" url={user.instagram} />
          )}
          {user.github && (
            <SocialLink type="github" url={user.github} />
          )}
          {user.website && (
            <SocialLink type="website" url={user.website} />
          )}
        </div>
        
        {/* vCard Download */}
        <VCardDownload
          profile={{
            firstName: user.first_name || undefined,
            lastName: user.last_name || undefined,
            title: user.title || undefined,
            email: user.email || undefined,
            website: user.website || undefined,
            linkedin: user.linkedin || undefined,
            github: user.github || undefined,
            instagram: user.instagram || undefined,
            bio: user.bio || undefined,
          }}
        />
      </div>
    </div>
  )
}

