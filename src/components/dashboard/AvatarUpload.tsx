'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { getUploadToken, getImageUrl } from '@/lib/imagekit/client'

interface AvatarUploadProps {
  currentUrl?: string | null
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({ currentUrl, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    // Upload to ImageKit
    setUploading(true)
    try {
      const authParams = await fetch('/api/imagekit/auth').then((r) => r.json())
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
      formData.append('token', authParams.token)
      formData.append('signature', authParams.signature)
      formData.append('expire', authParams.expire.toString())
      
      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      onUploadComplete(data.filePath)
      setPreview(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  
  const displayUrl = preview || (currentUrl ? getImageUrl(currentUrl, 'w-200,h-200,c-fill') : null)
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {displayUrl && (
        <div className="relative w-32 h-32 rounded-full border-4 border-[#4ECDC4] overflow-hidden">
          <Image
            src={displayUrl}
            alt="Avatar"
            fill
            className="object-cover"
          />
          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3AB5AD] transition-colors disabled:opacity-50">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : displayUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
        </div>
      </label>
    </div>
  )
}

