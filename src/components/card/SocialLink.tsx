import { ExternalLink, Github, Instagram, Linkedin } from 'lucide-react'
import Link from 'next/link'

interface SocialLinkProps {
  type: 'linkedin' | 'instagram' | 'github' | 'website'
  url: string
  label?: string
}

const iconMap = {
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  website: ExternalLink,
}

const labelMap = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  github: 'GitHub',
  website: 'Website',
}

export function SocialLink({ type, url, label }: SocialLinkProps) {
  const Icon = iconMap[type]
  const displayLabel = label || labelMap[type]
  
  if (!url) return null
  
  // Ensure URL has protocol
  const href = url.startsWith('http') ? url : `https://${url}`
  
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#4ECDC4] rounded-xl text-[#4ECDC4] font-medium transition-all hover:bg-[#4ECDC4] hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4ECDC4]/30"
    >
      <Icon className="w-5 h-5" />
      <span>{displayLabel}</span>
    </Link>
  )
}

