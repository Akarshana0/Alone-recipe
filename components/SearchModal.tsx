'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChefHat, Clock, ArrowRight } from 'lucide-react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Recipe } from '@/types/recipe'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SearchModalProps {
  open:    boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes,     setRecipes]     = useState<Recipe[]>([])
  const [activeIdx,   setActiveIdx]   = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) =>
      setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe))),
    )
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60)
      setSearchQuery('')
      setActiveIdx(0)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    if (!searchQuery.trim()) return recipes.slice(0, 6)
    const q = searchQuery.toLowerCase()
    return recipes
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.shortNote.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 8)
  }, [searchQuery, recipes])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && results[activeIdx]) {
      window.location.href = `/recipe/${results[activeIdx].id}`
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[14vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{   opacity: 0, scale: 0.96,  y: -8  }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl bg-[#0c0c18]/98 border border-white/[0.16] rounded-2xl shadow-glass-xl overflow-hidden backdrop-blur-3xl"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
                <Search className="h-4 w-4 text-white/30 shrink-0" />
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setActiveIdx(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search recipes, ingredients, tags…"
                  className="flex-1 bg-transparent text-white text-sm font-body placeholder-white/25 outline-none"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="text-white/25 hover:text-white/60 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-white/25">
                    Esc
                  </kbd>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[380px] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                    <ChefHat className="h-10 w-10 text-white/[0.06]" />
                    <p className="text-sm font-body text-white/25">Nothing found for &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                ) : (
                  <>
                    {!searchQuery && (
                      <p className="px-5 pb-1 pt-1 text-[10px] font-body text-white/20 uppercase tracking-widest">
                        Recent
                      </p>
                    )}
                    {results.map((r, i) => {
                      const totalTime = (r.cookTime ?? 0) + (r.prepTime ?? 0)
                      return (
                        <Link
                          key={r.id}
                          href={`/recipe/${r.id}`}
                          onClick={onClose}
                          onMouseEnter={() => setActiveIdx(i)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-100 group',
                            i === activeIdx
                              ? 'bg-brand-500/15 border border-brand-400/20'
                              : 'hover:bg-white/[0.04]',
                          )}
                        >
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.07] shrink-0 flex items-center justify-center">
                            {r.mediaUrl && r.mediaType === 'image' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.mediaUrl} alt={r.title} className="w-full h-full object-cover" />
                            ) : (
                              <ChefHat className="h-4 w-4 text-white/20" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-white/80 truncate group-hover:text-white transition-colors">
                              {r.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-body text-brand-400/70 bg-brand-500/10 px-1.5 py-0.5 rounded-full">
                                {r.category}
                              </span>
                              {totalTime > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-body text-white/25">
                                  <Clock className="h-2.5 w-2.5" /> {totalTime}m
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className={cn(
                            'h-3.5 w-3.5 transition-all duration-150',
                            i === activeIdx
                              ? 'text-brand-400'
                              : 'text-white/15 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0',
                          )} />
                        </Link>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-5 py-3 border-t border-white/[0.06]">
                {[['↑↓', 'navigate'], ['↵', 'open'], ['Esc', 'close']].map(([key, label]) => (
                  <span key={key} className="flex items-center gap-1 text-[10px] font-body text-white/20">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono">{key}</kbd>
                    {label}
                  </span>
                ))}
                <span className="ml-auto text-[10px] font-body text-white/15">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
