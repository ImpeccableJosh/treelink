import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/helpers'
import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/signin')
  }
  
  const supabase = await createClient()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-[#4ECDC4]">
                Gather
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#4ECDC4] transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <a
                href="/api/auth/signout"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </a>
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

