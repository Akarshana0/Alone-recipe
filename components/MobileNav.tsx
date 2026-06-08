'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bookmark, Calendar, Info, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaved } from '@/hooks/useSaved'
import { useState, useCallback } from 'react'
import SearchModal from './SearchModal'

const links = [
  { href: '/',          label: 'Home',     icon: Home     },
  { href: '/saved',     label: 'Saved',    icon: Bookmark },
  { href: '/meal-plan', label: 'Planner',  icon: Calendar },
  { href: '/about',     label: 'About',    icon: Info     },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { count, hydrated } = useSaved()
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  return (
    <>
      <SearchModal open={searchOpen} onClose={closeSearch} />
      <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden">
        {/* Backdrop blur bar */}
        <div className="mx-3 mb-3 rounded-2xl bg-[#0a0a14]/85 border border-white/[0.12] backdrop-blur-2xl shadow-glass-xl">
          <div className="flex items-center justify-around h-16 px-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              const showBadge = href === '/saved' && hydrated && count > 0
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
                    active ? 'text-brand-400' : 'text-white/35 hover:text-white/60',
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('h-5 w-5 transition-transform duration-200', active && 'scale-110')} />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-[14px] px-0.5 rounded-full bg-brand-500 text-[8px] font-mono font-bold text-white flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-body font-medium">{label}</span>
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(249,115,22,0.9)]" />
                  )}
                </Link>
              )
            })}
            {/* Search button */}
            <button
              onClick={openSearch}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-white/35 hover:text-white/60 transition-all duration-200"
            >
              <Search className="h-5 w-5" />
              <span className="text-[10px] font-body font-medium">Search</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
