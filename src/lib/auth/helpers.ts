import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth(redirectTo?: string) {
  const user = await getUser()
  if (!user) {
    const signinUrl = redirectTo 
      ? `/signin?redirect=${encodeURIComponent(redirectTo)}`
      : '/signin'
    redirect(signinUrl)
  }
  return user
}

export async function isOrgMember(organizationId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()
  
  return { isMember: !!data, role: data?.role, error }
}

export async function requireOrgAccess(organizationId: string, minRole: 'member' | 'admin' | 'owner' = 'member') {
  const user = await requireAuth()
  const { isMember, role } = await isOrgMember(organizationId, user.id)
  
  if (!isMember) {
    redirect('/dashboard')
  }
  
  const roleHierarchy = { member: 0, admin: 1, owner: 2 }
  if (roleHierarchy[role as keyof typeof roleHierarchy] < roleHierarchy[minRole]) {
    redirect('/dashboard')
  }
  
  return { user, role }
}

