'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?:  boolean
  dark?:  boolean
  glint?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, dark = false, glint = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // base glass
        'relative rounded-2xl border backdrop-blur-xl overflow-hidden',
        dark
          ? 'bg-black/30 border-white/[0.09]'
          : 'bg-white/[0.06] border-white/[0.11]',
        // inner top highlight
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
        // drop shadow
        'shadow-glass',
        // glint sweep
        glint && 'glass-glint',
        // optional hover
        hover && [
          'transition-all duration-300 ease-out cursor-pointer',
          'hover:bg-white/[0.10] hover:border-white/[0.20] hover:shadow-glass-lg hover:-translate-y-1',
        ],
        // optional glow ring
        glow && 'ring-1 ring-brand-400/35 shadow-glow animate-border-glow',
        className,
      )}
      {...props}
    />
  ),
)
GlassCard.displayName = 'GlassCard'

export default GlassCard
