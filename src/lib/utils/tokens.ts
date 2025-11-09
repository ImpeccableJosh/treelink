import { randomBytes } from 'crypto'

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export function generateSignupToken(): string {
  return generateSecureToken(16)
}

export function generatePublicToken(): string {
  return generateSecureToken(28)
}

export function generateDeviceSecret(): string {
  return generateSecureToken(32)
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

