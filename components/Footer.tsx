'use client'

import Link from 'next/link'
import { Flame, Heart, Github } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/[0.06] mt-16">
      {/* Ambient glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 group-hover:shadow-glow-sm transition-all duration-300">
              <Flame className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-display text-base font-bold text-white/70 group-hover:text-white transition-colors duration-200">
              ALONE <span className="text-brand-500">recipes</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {[
              { href: '/',          label: 'Recipes' },
              { href: '/meal-plan', label: 'Planner' },
              { href: '/saved',     label: 'Saved'   },
              { href: '/about',     label: 'About'   },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-body text-white/30 hover:text-white/70 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Credit */}
          <p className="flex items-center gap-1.5 text-xs font-body text-white/20">
            Made with <Heart className="h-3 w-3 text-brand-500/70 fill-brand-500/70" /> in solitude · {year}
          </p>
        </div>
      </div>
    </footer>
  )
}
