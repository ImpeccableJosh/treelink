import { redirect } from 'next/navigation'
import { getUser, requireAuth } from '@/lib/auth/helpers'
import { getSession } from '@/lib/auth/helpers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Users, Radio, BarChart3, Settings } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ org_slug: string }>
}

export default async function OrgLayout({ children, params }: LayoutProps) {
  const { org_slug } = await params
  const supabase = await createServiceClient()
  
  // Check auth first
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()
  // Check if user is already signed in
  const session = await getSession()
  const user = session?.user || null
  if (!user) {
    redirect(`/signin?redirect=${encodeURIComponent(`/org/${org_slug}`)}`)
  }
  console.log(org_slug)
  // Get organization
  const orgResult: any = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', org_slug)
    .single()
  
  
  const org = orgResult?.data as any
  const orgError = orgResult?.error
  if (orgError || !org) {
    // redirect('/dashboardii')
  }
  
  // Check membership
  const memberResult: any = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user?.id)
    .single()
  
  const member = memberResult?.data as any
  const memberError = memberResult?.error

  if (memberError || !member) {
    redirect('/dashboard')
  }
  
  const navItems = [
    { href: `/org/${org_slug}`, label: 'Overview', icon: LayoutDashboard },
    { href: `/org/${org_slug}/applications`, label: 'Applications', icon: Users },
    { href: `/org/${org_slug}/devices`, label: 'Devices', icon: Radio },
    { href: `/org/${org_slug}/analytics`, label: 'Analytics', icon: BarChart3 },
  ]
  
  if (member.role === 'owner' || member.role === 'admin') {
    navItems.push({ href: `/org/${org_slug}/settings`, label: 'Settings', icon: Settings })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-[#4ECDC4]">
                Gather
              </Link>
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#4ECDC4] transition-colors rounded-lg hover:bg-gray-50"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

