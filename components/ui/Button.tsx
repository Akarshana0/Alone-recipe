'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'glass'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size    = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const base = [
      'inline-flex items-center justify-center gap-2 font-body font-semibold',
      'rounded-xl transition-all duration-200 ease-out select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60',
      'disabled:opacity-50 disabled:pointer-events-none',
    ]

    const variants = {
      primary: [
        'bg-gradient-to-r from-brand-500 to-brand-600',
        'text-white shadow-glow-sm',
        'hover:from-brand-400 hover:to-brand-500 hover:shadow-glow hover:-translate-y-0.5',
        'active:translate-y-0',
      ],
      ghost: [
        'bg-transparent text-white/80',
        'hover:bg-white/10 hover:text-white',
      ],
      danger: [
        'bg-red-500/20 border border-red-400/30 text-red-300',
        'hover:bg-red-500/30 hover:border-red-400/50',
      ],
      glass: [
        'bg-white/[0.08] border border-white/[0.14] text-white backdrop-blur-xl',
        'hover:bg-white/[0.14] hover:border-white/25',
      ],
    }

    const sizes = {
      sm: 'h-8  px-3 text-sm',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export default Button
