'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AvatarUpload } from './AvatarUpload'

interface Profile {
  first_name?: string | null
  last_name?: string | null
  title?: string | null
  tagline?: string | null
  bio?: string | null
  linkedin?: string | null
  instagram?: string | null
  github?: string | null
  website?: string | null
  avatar_url?: string | null
  email?: string | null
}

interface ProfileEditorProps {
  initialProfile?: Profile
}

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile || {})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  const handleAvatarUpload = (url: string) => {
    setProfile({ ...profile, avatar_url: url })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <AvatarUpload
          currentUrl={profile.avatar_url}
          onUploadComplete={handleAvatarUpload}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={profile.first_name || ''}
          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
        />
        <Input
          label="Last Name"
          value={profile.last_name || ''}
          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
        />
      </div>
      
      <Input
        label="Email"
        type="email"
        value={profile.email || ''}
        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
      />
      
      <Input
        label="Title"
        value={profile.title || ''}
        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
        placeholder="e.g., Software Engineer"
      />
      
      <Input
        label="Tagline"
        value={profile.tagline || ''}
        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
        placeholder="A short tagline about yourself"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={profile.bio || ''}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="LinkedIn"
          value={profile.linkedin || ''}
          onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
          placeholder="https://linkedin.com/in/username"
        />
        <Input
          label="GitHub"
          value={profile.github || ''}
          onChange={(e) => setProfile({ ...profile, github: e.target.value })}
          placeholder="https://github.com/username"
        />
        <Input
          label="Instagram"
          value={profile.instagram || ''}
          onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
          placeholder="https://instagram.com/username"
        />
        <Input
          label="Website"
          value={profile.website || ''}
          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          placeholder="https://yourwebsite.com"
        />
      </div>
      
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}

