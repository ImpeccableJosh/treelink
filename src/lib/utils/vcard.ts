export interface VCardData {
  firstName?: string
  lastName?: string
  title?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  instagram?: string
  bio?: string
}

export function generateVCard(data: VCardData): string {
  const lines: string[] = []
  
  lines.push('BEGIN:VCARD')
  lines.push('VERSION:3.0')
  
  // Name
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Contact'
  lines.push(`FN:${escapeVCard(fullName)}`)
  if (data.firstName || data.lastName) {
    lines.push(`N:${escapeVCard(data.lastName || '')};${escapeVCard(data.firstName || '')};;;`)
  }
  
  // Title
  if (data.title) {
    lines.push(`TITLE:${escapeVCard(data.title)}`)
  }
  
  // Email
  if (data.email) {
    lines.push(`EMAIL:${escapeVCard(data.email)}`)
  }
  
  // Phone
  if (data.phone) {
    lines.push(`TEL:${escapeVCard(data.phone)}`)
  }
  
  // Website
  if (data.website) {
    lines.push(`URL:${escapeVCard(data.website)}`)
  }
  
  // Social links (using URL field with label)
  if (data.linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVCard(data.linkedin)}`)
  }
  if (data.github) {
    lines.push(`URL;TYPE=GitHub:${escapeVCard(data.github)}`)
  }
  if (data.instagram) {
    lines.push(`URL;TYPE=Instagram:${escapeVCard(data.instagram)}`)
  }
  
  // Note/Bio
  if (data.bio) {
    lines.push(`NOTE:${escapeVCard(data.bio)}`)
  }
  
  lines.push('END:VCARD')
  
  return lines.join('\r\n')
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

