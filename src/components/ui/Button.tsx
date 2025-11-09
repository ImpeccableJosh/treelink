import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses = {
    primary: 'bg-[#4ECDC4] hover:bg-[#3AB5AD] active:bg-[#2A9D8F] text-white',
    secondary: 'bg-white border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-[#A8E6CF]',
    ghost: 'bg-transparent text-[#4ECDC4] hover:bg-gray-100',
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

