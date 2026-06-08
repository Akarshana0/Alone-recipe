'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value:     string
  onChange:  (v: string) => void
  className?: string
}

const PLACEHOLDERS = [
  'Search recipes, ingredients…',
  'Try "pasta", "vegan", "quick"…',
  'What are you craving today?',
  'Explore by ingredient…',
  'Find your next favourite dish…',
]

export default function SearchBar({ value, onChange, className }: SearchBarProps) {
  const [focused, setFocused]     = useState(false)
  const [phIndex, setPhIndex]     = useState(0)
  const [phVisible, setPhVisible] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cycle placeholder text when unfocused and empty
  useEffect(() => {
    if (focused || value) return
    const cycle = setInterval(() => {
      setPhVisible(false)
      setTimeout(() => {
        setPhIndex((i) => (i + 1) % PLACEHOLDERS.length)
        setPhVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(cycle)
  }, [focused, value])

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)}>

      {/* Glow ring */}
      <div
        className={cn(
          'absolute -inset-[2px] rounded-[18px] transition-opacity duration-400',
          'bg-gradient-to-r from-brand-600/0 via-brand-400/50 to-brand-600/0',
          focused ? 'opacity-100' : value ? 'opacity-60' : 'opacity-0',
        )}
        style={{ filter: 'blur(4px)' }}
      />

      <div className="relative flex items-center">
        {/* Search icon */}
        <div className={cn(
          'absolute left-4 transition-all duration-300',
          focused ? 'text-brand-400 scale-110' : 'text-white/35 scale-100',
        )}>
          <Search className="h-5 w-5" strokeWidth={2.5} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDERS[phIndex]}
          className={cn(
            'w-full h-14 pl-12 pr-12 rounded-2xl',
            'bg-white/[0.06] border backdrop-blur-xl',
            'text-white font-body text-base',
            'outline-none transition-all duration-300',
            'placeholder:transition-opacity placeholder:duration-300',
            !phVisible && 'placeholder:opacity-0',
            focused
              ? 'bg-white/[0.10] border-brand-400/40'
              : 'border-white/[0.11] hover:border-white/20 hover:bg-white/[0.08]',
          )}
        />

        {/* Sparkle / clear */}
        <div className="absolute right-4">
          {value ? (
            <button
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Sparkles
              className={cn(
                'h-4 w-4 transition-all duration-300',
                focused ? 'text-brand-400 opacity-100' : 'text-white/20 opacity-60',
              )}
            />
          )}
        </div>
      </div>

      {/* Bottom hint */}
      {focused && (
        <p className="absolute -bottom-6 left-4 text-xs text-white/25 font-body animate-fade-in">
          Search by title, ingredient, or category
        </p>
      )}
    </div>
  )
}
