'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Bookmark, Search, Command, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSaved } from '@/hooks/useSaved'
import SearchModal from './SearchModal'

export default function Navbar() {
  const pathname              = usePathname()
  const lastY                 = useRef(0)
  const [scrolled, setScrolled] = useState(false)
  const [visible,  setVisible]  = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count, hydrated }   = useSaved()

  const openSearch  = useCallback(() => setSearchOpen(true),  [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y < lastY.current || y < 80)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen((o) => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = [
    { href: '/',          label: 'Recipes'  },
    { href: '/meal-plan', label: 'Planner', icon: Calendar },
    { href: '/saved',     label: 'Saved',   badge: hydrated && count > 0 ? count : null },
    { href: '/about',     label: 'About'   },
  ]

  return (
    <>
      <SearchModal open={searchOpen} onClose={closeSearch} />
      <header className={cn('fixed top-0 inset-x-0 z-50 transition-all duration-400', !visible && '-translate-y-full')}>
        <div className={cn(
          'mx-4 mt-4 rounded-2xl transition-all duration-500 border',
          scrolled ? 'bg-black/55 border-white/[0.15] backdrop-blur-3xl shadow-glass-lg' : 'bg-white/[0.05] border-white/[0.09] backdrop-blur-2xl',
        )}>
          <nav className="flex items-center justify-between px-5 h-14 max-w-6xl mx-auto gap-4">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 transition-all duration-300 group-hover:shadow-glow overflow-hidden">
                <span className="absolute inset-0 rounded-xl bg-brand-500/40 scale-100 group-hover:scale-[1.8] group-hover:opacity-0 transition-all duration-600" />
                <Flame className="h-4 w-4 text-white relative z-10" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                ALONE<span className="text-brand-400 ml-1 group-hover:text-brand-300 transition-colors duration-200">recipes</span>
              </span>
            </Link>

            <button
              onClick={openSearch}
              className="hidden sm:flex flex-1 max-w-xs items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/25 text-xs font-body transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.14] hover:text-white/45 group"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">Search recipes…</span>
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.07] border border-white/[0.1] text-[10px] font-mono text-white/20 group-hover:text-white/35 transition-colors shrink-0">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <div className="flex items-center gap-1">
              <button onClick={openSearch} className="sm:hidden h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-all duration-200" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
              <ul className="hidden sm:flex items-center gap-1">
                {links.map((l) => {
                  const active = pathname === l.href
                  return (
                    <li key={l.href}>
                      <Link href={l.href} className={cn(
                        'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-200',
                        active ? 'bg-white/[0.12] text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.07]',
                      )}>
                        {l.href === '/saved' && <Bookmark className={cn('h-3.5 w-3.5', active ? 'text-brand-400' : '')} />}
                        {l.href === '/meal-plan' && <Calendar className={cn('h-3.5 w-3.5', active ? 'text-violet-400' : '')} />}
                        {l.label}
                        {l.badge != null && (
                          <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-300 text-[10px] font-mono font-bold">{l.badge}</span>
                        )}
                        {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(249,115,22,0.9)]" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
