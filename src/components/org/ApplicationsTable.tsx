'use client'

import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'

interface Application {
  id: string
  status: string
  created_at: string
  completed_at?: string
  users?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  application_types?: {
    title?: string
  }
}

interface ApplicationsTableProps {
  applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'awaiting_user':
      case 'pending':
        return 'warning'
      case 'expired':
      case 'closed':
        return 'error'
      default:
        return 'default'
    }
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>No applications yet. Applications will appear here after cards are scanned.</p>
      </div>
    )
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                {app.users
                  ? `${app.users.first_name || ''} ${app.users.last_name || ''}`.trim() || app.users.email || 'Unknown'
                  : 'Unknown'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {app.application_types?.title || 'General'}
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusVariant(app.status)}>
                  {app.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {format(new Date(app.created_at), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

