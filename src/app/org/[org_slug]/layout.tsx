import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Users, Radio, BarChart3, Settings } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ org_slug: string }>
}

export default async function OrgLayout({ children, params }: LayoutProps) {
  const { org_slug } = await params
  const supabase = await createClient()
  
  // Check auth first
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/signin?redirect=${encodeURIComponent(`/org/${org_slug}`)}`)
  }
  
  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', org_slug)
    .single()
  
  if (!org) {
    redirect('/dashboard')
  }
  
  // Check membership
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()
  
  if (!member) {
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
                Treelink
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

