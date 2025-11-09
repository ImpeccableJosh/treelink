import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  }
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

