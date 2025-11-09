import ImageKit from 'imagekit'

function createImageKitInstance() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('ImageKit keys are not configured')
  }

  return new ImageKit({ publicKey, privateKey, urlEndpoint })
}

export function getUploadToken() {
  // Initialize ImageKit lazily — only on server code paths that call this.
  const imagekit = createImageKitInstance()
  const token = imagekit.getAuthenticationParameters()
  return token
}

export function getImageUrl(path: string | null | undefined, transformations?: string) {
  if (!path) return null
  if (path.startsWith('http')) return path

  const baseUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
  // Normalize base URL (remove trailing slash)
  const normalizedBase = baseUrl.replace(/\/+$/, '')

  if (transformations) {
    return `${normalizedBase}/tr:${transformations}/${path}`
  }
  return `${normalizedBase}/${path}`
}

