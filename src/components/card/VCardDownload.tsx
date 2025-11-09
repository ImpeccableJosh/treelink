'use client'

import { Download } from 'lucide-react'
import { generateVCard, VCardData } from '@/lib/utils/vcard'
import { Button } from '@/components/ui/Button'

interface VCardDownloadProps {
  profile: VCardData
}

export function VCardDownload({ profile }: VCardDownloadProps) {
  const handleDownload = () => {
    const vcard = generateVCard(profile)
    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.firstName || 'contact'}_${profile.lastName || ''}.vcf`.trim()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <Button
      variant="secondary"
      onClick={handleDownload}
      className="w-full flex items-center justify-center gap-2"
    >
      <Download className="w-5 h-5" />
      Download vCard
    </Button>
  )
}

