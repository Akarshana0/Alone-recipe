'use client'

import { useRef, useState } from 'react'
import { CATEGORIES, type Category } from '@/types/recipe'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selected: Category
  onChange: (c: Category) => void
}

const icons: Record<Category, string> = {
  'All':         '✦',
  'Breakfast':   '🌅',
  'Lunch':       '☀️',
  'Dinner':      '🌙',
  'Desserts':    '🍰',
  'Snacks':      '🍿',
  'Drinks':      '🥤',
  'Vegan':       '🌿',
  'Quick Meals': '⚡',
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const [hovered, setHovered] = useState<Category | null>(null)

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map((cat) => {
        const active = selected === cat
        const isHov  = hovered === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body font-medium',
              'border transition-all duration-250 overflow-hidden',
              active
                ? [
                    'bg-brand-500/15 border-brand-400/50 text-brand-200',
                    'shadow-[0_0_20px_rgba(249,115,22,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]',
                  ]
                : [
                    'bg-white/[0.04] border-white/[0.08] text-white/45',
                    'hover:bg-white/[0.09] hover:border-white/[0.18] hover:text-white/80',
                    'hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
                  ],
            )}
          >
            {/* Glint sweep on hover */}
            {(isHov || active) && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
                  animation: 'glintSweep 0.5s ease-out forwards',
                }}
              />
            )}

            <span className={cn('transition-transform duration-200', isHov && 'scale-125')}>
              {icons[cat]}
            </span>
            <span>{cat}</span>

            {/* Active dot */}
            {active && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
