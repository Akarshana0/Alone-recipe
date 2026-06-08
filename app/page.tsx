'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, ChefHat, BookOpen, Zap, ArrowUpDown, Shuffle, TrendingUp } from 'lucide-react'
import { db } from '@/lib/firebase'
import type { Recipe, Category, Difficulty, SortOption } from '@/types/recipe'
import { DIFFICULTIES } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import FeaturedRecipe from '@/components/FeaturedRecipe'
import TagCloud from '@/components/TagCloud'
import { RecipeGridSkeleton } from '@/components/ui/SkeletonLoader'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'a-z',    label: 'A → Z'        },
  { value: 'z-a',    label: 'Z → A'        },
  { value: 'quick',  label: 'Quickest'     },
]

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

export default function HomePage() {
  const router = useRouter()
  const [recipes,   setRecipes]    = useState<Recipe[]>([])
  const [loading,   setLoading]    = useState(true)
  const [search,    setSearch]     = useState('')
  const [category,  setCategory]   = useState<Category>('All')
  const [difficulty,setDifficulty] = useState<Difficulty | 'All'>('All')
  const [sort,      setSort]       = useState<SortOption>('newest')
  const [sortOpen,  setSortOpen]   = useState(false)
  const [tagFilter, setTagFilter]  = useState('')
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOp = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  useEffect(() => {
    const q     = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe)))
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!sortOpen) return
    const close = () => setSortOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [sortOpen])

  const featured = useMemo(() => recipes.find((r) => r.isFeatured), [recipes])

  // Collect all tags
  const allTags = useMemo(() => {
    const map = new Map<string, number>()
    recipes.forEach(r => r.tags?.forEach(t => map.set(t, (map.get(t) || 0) + 1)))
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t)
  }, [recipes])

  const filtered = useMemo(() => {
    let r = [...recipes]
    if (category !== 'All')   r = r.filter((x) => x.category === category)
    if (difficulty !== 'All') r = r.filter((x) => x.difficulty === difficulty)
    if (tagFilter)            r = r.filter((x) => x.tags?.includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.shortNote.toLowerCase().includes(q) ||
          x.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          x.tags?.some((t) => t.toLowerCase().includes(q)),
      )
    }
    switch (sort) {
      case 'oldest': r = r.reverse(); break
      case 'a-z':    r = r.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'z-a':    r = r.sort((a, b) => b.title.localeCompare(a.title)); break
      case 'quick':
        r = r.sort((a, b) => {
          const ta = (a.cookTime ?? 999) + (a.prepTime ?? 999)
          const tb = (b.cookTime ?? 999) + (b.prepTime ?? 999)
          return ta - tb
        })
        break
    }
    return r
  }, [recipes, category, difficulty, search, sort, tagFilter])

  const categoryCount    = useMemo(() => [...new Set(recipes.map((r) => r.category))].length, [recipes])
  const avgCookTime      = useMemo(() => {
    const valid = recipes.filter(r => r.cookTime || r.prepTime)
    if (!valid.length) return 0
    return Math.round(valid.reduce((a, r) => a + (r.cookTime ?? 0) + (r.prepTime ?? 0), 0) / valid.length)
  }, [recipes])
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort'

  const handleLucky = () => {
    if (recipes.length === 0) return
    const pick = recipes[Math.floor(Math.random() * recipes.length)]
    router.push(`/recipe/${pick.id}`)
  }

  const hasActiveFilter = search || category !== 'All' || difficulty !== 'All' || tagFilter

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative flex flex-col items-center text-center gap-7 pt-10 pb-4">
        <motion.div style={{ y: heroY, opacity: heroOp }} className="flex flex-col items-center gap-7 w-full">

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1   }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 text-brand-300 text-xs font-body font-semibold tracking-widest uppercase backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" />
            Handcrafted with love
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight"
          >
            Every dish tells{' '}
            <span className="text-gradient-brand">a story.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-xl text-lg text-white/40 font-body leading-relaxed"
          >
            Explore curated recipes — from quick weekday bites to weekend
            showstoppers. Cooked alone, shared forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="w-full pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button
              onClick={handleLucky}
              disabled={recipes.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white/50 hover:text-white/80 hover:bg-white/[0.1] hover:border-white/[0.18] transition-all duration-200 text-sm font-body font-medium disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              title="Open a random recipe"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Feeling Lucky</span>
            </button>
          </motion.div>

          {/* Stats strip — enhanced with avg cook time */}
          {!loading && recipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-8 pt-4"
            >
              {[
                { icon: BookOpen,   value: recipes.length,                                                                    label: 'Recipes'    },
                { icon: ChefHat,    value: categoryCount,                                                                     label: 'Categories' },
                { icon: Zap,        value: recipes.filter(r => (r.cookTime ?? 99) + (r.prepTime ?? 99) <= 30).length || '∞', label: 'Under 30m'  },
                { icon: TrendingUp, value: avgCookTime ? `${avgCookTime}m` : '—',                                            label: 'Avg Time'   },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-brand-400/70" />
                    <span className="font-display text-2xl font-bold text-white/80">{value}</span>
                  </div>
                  <span className="text-xs font-body text-white/25 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {!loading && featured && <FeaturedRecipe recipe={featured} />}

      {/* Category Filter */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-5"
      >
        <CategoryFilter selected={category} onChange={setCategory} />
      </motion.section>

      {/* Difficulty Filter */}
      {!loading && recipes.some((r) => r.difficulty) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center gap-2 mb-6 flex-wrap"
        >
          <span className="text-[10px] font-body text-white/20 uppercase tracking-widest mr-1">Difficulty</span>
          {(['All', ...DIFFICULTIES] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-body font-medium border transition-all duration-200',
                difficulty === d
                  ? d === 'All'
                    ? 'bg-white/[0.12] border-white/[0.2] text-white'
                    : d === 'Easy'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : d === 'Medium'
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                        : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/65 hover:border-white/[0.14]',
              )}
            >
              {d}
            </button>
          ))}
        </motion.div>
      )}

      {/* Tag Cloud */}
      {!loading && allTags.length > 0 && (
        <TagCloud tags={allTags} selected={tagFilter} onSelect={setTagFilter} />
      )}

      {/* Recipe Grid */}
      <section className="pb-8">
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-xs font-body text-white/25 uppercase tracking-widest">
              {filtered.length === 0
                ? 'No recipes found'
                : `${filtered.length} recipe${filtered.length > 1 ? 's' : ''}`}
            </p>

            <div className="flex items-center gap-3">
              {hasActiveFilter && (
                <button
                  onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All'); setTagFilter('') }}
                  className="text-xs text-brand-400/60 hover:text-brand-400 font-body transition-colors"
                >
                  Clear filters
                </button>
              )}

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-body font-medium transition-all duration-200',
                    sortOpen
                      ? 'bg-brand-500/15 border-brand-400/40 text-brand-300'
                      : 'bg-white/[0.05] border-white/[0.09] text-white/40 hover:text-white/70 hover:border-white/[0.15]',
                  )}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {currentSortLabel}
                </button>

                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    className="absolute right-0 top-full mt-2 w-44 bg-[#0f0f18]/95 border border-white/[0.12] rounded-xl overflow-hidden shadow-glass backdrop-blur-2xl z-20"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => { setSort(o.value); setSortOpen(false) }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-xs font-body transition-all duration-150',
                          sort === o.value
                            ? 'bg-brand-500/20 text-brand-300 font-semibold'
                            : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <RecipeGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center gap-5 py-28 text-center"
          >
            <span className="text-7xl animate-float inline-block">🍽️</span>
            <p className="font-display text-2xl text-white/25">No recipes yet</p>
            <p className="text-sm text-white/15 font-body max-w-xs leading-relaxed">
              {search ? `Nothing matched "${search}". Try a different keyword.` : 'Start adding recipes from the admin panel.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}
