import ImageKit from 'imagekit'

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
})

export function getUploadToken() {
  const token = imagekit.getAuthenticationParameters()
  return token
}

export function getImageUrl(path: string, transformations?: string) {
  if (!path) return null
  if (path.startsWith('http')) return path
  
  const baseUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
  if (transformations) {
    return `${baseUrl}/tr:${transformations}/${path}`
  }
  return `${baseUrl}/${path}`
}

