import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  const baseClasses = 'bg-white rounded-xl p-6'
  const shadowClass = elevated 
    ? 'shadow-lg' 
    : 'shadow-sm border border-gray-200'
  
  return (
    <div className={`${baseClasses} ${shadowClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

