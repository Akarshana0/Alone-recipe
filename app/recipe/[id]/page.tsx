'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, doc, getDocs, getDoc, limit, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckSquare, FlameKindling,
  ListOrdered, Tag, Utensils, Check,
  Heart, Share2, Printer, Clock, Users,
  ChefHat, Lightbulb, Maximize2,
} from 'lucide-react'
import type { Recipe } from '@/types/recipe'
import { DIFFICULTY_COLORS } from '@/types/recipe'
import MediaPlayer from '@/components/MediaPlayer'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { DetailSkeleton } from '@/components/ui/SkeletonLoader'
import CookTimer from '@/components/CookTimer'
import CookingMode from '@/components/CookingMode'
import RecipeCard from '@/components/RecipeCard'
import NutritionCard from '@/components/NutritionCard'
import RatingWidget from '@/components/RatingWidget'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import { useSaved } from '@/hooks/useSaved'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

function scaleText(text: string, factor: number): string {
  if (factor === 1) return text
  return text.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) => {
    const val = parseFloat(m) * factor
    if (val === Math.floor(val)) return String(Math.floor(val))
    return (Math.round(val * 10) / 10).toString()
  })
}

type JumpSection = 'ingredients' | 'mixing' | 'cooking' | 'nutrition'

export default function RecipeDetailPage() {
  const { id }              = useParams<{ id: string }>()
  const router              = useRouter()
  const { isSaved, toggle } = useSaved()

  const [recipe,  setRecipe]  = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [related, setRelated] = useState<Recipe[]>([])

  const [servings, setServings] = useState<number>(2)
  const [baseServ, setBaseServ] = useState<number>(2)

  const [activeSection, setActiveSection] = useState<JumpSection>('ingredients')

  const ingredientsRef = useRef<HTMLDivElement>(null)
  const mixingRef      = useRef<HTMLDivElement>(null)
  const cookingRef     = useRef<HTMLDivElement>(null)
  const nutritionRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'recipes', id))
      .then((snap) => {
        if (!snap.exists()) { setError(true); return }
        const r = { id: snap.id, ...snap.data() } as Recipe
        setRecipe(r)
        const s = r.servings ?? 2
        setServings(s)
        setBaseServ(s)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!recipe) return
    const q = query(
      collection(db, 'recipes'),
      where('category', '==', recipe.category),
      limit(4),
    )
    getDocs(q).then((snap) => {
      setRelated(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Recipe))
          .filter((r) => r.id !== recipe.id)
          .slice(0, 3),
      )
    })
  }, [recipe])

  // Intersection observer for jump nav highlight
  useEffect(() => {
    if (!recipe) return
    const refs = [
      { ref: ingredientsRef, id: 'ingredients' as JumpSection },
      { ref: mixingRef,      id: 'mixing'      as JumpSection },
      { ref: cookingRef,     id: 'cooking'     as JumpSection },
      { ref: nutritionRef,   id: 'nutrition'   as JumpSection },
    ]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const found = refs.find((r) => r.ref.current === entry.target)
            if (found) setActiveSection(found.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    refs.forEach(({ ref }) => { if (ref.current) observer.observe(ref.current) })
    return () => observer.disconnect()
  }, [recipe])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleIngredient = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe?.title, text: recipe?.shortNote, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied! 🔗')
      }
    } catch {}
  }

  const handlePrint = () => window.print()

  const [cookingMode, setCookingMode] = useState(false)

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4">
      <ScrollProgressBar />
      <DetailSkeleton />
    </div>
  )

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
        <span className="text-7xl animate-float inline-block">😕</span>
        <p className="font-display text-3xl text-white/30">Recipe not found</p>
        <Button variant="glass" onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4" /> Back to recipes
        </Button>
      </div>
    )
  }

  const cookSteps   = recipe.cookingInstructions.split('\n').filter(Boolean)
  const mixingSteps = recipe.mixingInstructions.split('\n').filter(Boolean)
  const checkedCount = checked.size
  const total        = recipe.ingredients.length
  const progress     = total > 0 ? (checkedCount / total) * 100 : 0
  const scaleFactor  = servings / baseServ
  const saved        = isSaved(recipe.id)
  const totalTime    = (recipe.cookTime ?? 0) + (recipe.prepTime ?? 0)

  const hasNutrition = recipe.nutrition && Object.values(recipe.nutrition).some((v) => v != null)
  const hasMixing    = mixingSteps.length > 0
  const hasCooking   = cookSteps.length > 0

  // Build jump nav items
  const jumpItems: { id: JumpSection; label: string; ref: React.RefObject<HTMLDivElement | null> }[] = [
    { id: 'ingredients', label: 'Ingredients', ref: ingredientsRef },
    ...(hasMixing  ? [{ id: 'mixing'    as JumpSection, label: 'Mixing',    ref: mixingRef     }] : []),
    ...(hasCooking ? [{ id: 'cooking'   as JumpSection, label: 'Cooking',   ref: cookingRef    }] : []),
    ...(hasNutrition ? [{ id: 'nutrition' as JumpSection, label: 'Nutrition', ref: nutritionRef }] : []),
  ]

  return (
    <>
      <ScrollProgressBar />

      {/* Cooking Mode overlay */}
      <AnimatePresence>
        {cookingMode && recipe && (
          <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 print:space-y-6"
      >
        {/* ── Action bar ── */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center justify-between flex-wrap gap-3 print:hidden"
        >
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <CookTimer suggestedMinutes={recipe.cookTime ?? 10} />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCookingMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/20 border border-brand-400/40 text-brand-200 hover:bg-brand-500/30 hover:border-brand-400/60 transition-all duration-200 text-sm font-body font-semibold"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Cooking Mode</span>
            </motion.button>

            <button
              onClick={() => toggle(recipe.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-body transition-all duration-200',
                saved
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-white/[0.05] border-white/[0.1] text-white/50 hover:bg-rose-500/10 hover:border-rose-400/30 hover:text-rose-300',
              )}
            >
              <Heart className={cn('h-4 w-4', saved && 'fill-rose-300')} />
              {saved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/50 hover:bg-white/[0.09] hover:text-white/80 text-sm font-body transition-all duration-200"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/35 hover:text-white/60 hover:bg-white/[0.07] transition-all duration-200"
              title="Print recipe"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* ── Header ── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold bg-brand-500/15 border border-brand-400/25 text-brand-300">
              <Tag className="h-3 w-3" /> {recipe.category}
            </span>

            {recipe.difficulty && (
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-semibold border',
                DIFFICULTY_COLORS[recipe.difficulty],
              )}>
                {recipe.difficulty}
              </span>
            )}

            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body bg-white/[0.06] border border-white/[0.1] text-white/50">
                <Clock className="h-3 w-3" />
                {recipe.prepTime ? `${recipe.prepTime}m prep · ` : ''}{recipe.cookTime ? `${recipe.cookTime}m cook` : `${totalTime}m total`}
              </span>
            )}

            {checkedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 animate-fade-in">
                <Check className="h-3 w-3" /> {checkedCount} of {total} prepped
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-white print:text-black">
            {recipe.title}
          </h1>
          <p className="text-lg text-white/45 font-body leading-relaxed max-w-2xl print:text-black/60">
            {recipe.shortNote}
          </p>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-body bg-white/[0.05] border border-white/[0.08] text-white/35">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Media ── */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="print:hidden">
          <MediaPlayer url={recipe.mediaUrl} type={recipe.mediaType} alt={recipe.title} />
        </motion.div>

        {/* ── Jump Navigation ── */}
        {jumpItems.length > 1 && (
          <motion.div
            custom={2.5} variants={fadeUp} initial="hidden" animate="visible"
            className="print:hidden sticky top-20 z-30"
          >
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0c0c18]/90 border border-white/[0.1] backdrop-blur-2xl w-fit shadow-glass">
              {jumpItems.map(({ id: sectionId, label, ref }) => (
                <button
                  key={sectionId}
                  onClick={() => scrollTo(ref)}
                  className={cn(
                    'px-4 py-1.5 rounded-xl text-xs font-body font-medium transition-all duration-200',
                    activeSection === sectionId
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-400/30'
                      : 'text-white/35 hover:text-white/65 hover:bg-white/[0.05]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Ingredients */}
          <motion.div ref={ingredientsRef} custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <GlassCard className="p-6 h-full flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                    <Utensils className="h-5 w-5 text-brand-400" />
                    Ingredients
                  </h2>
                  <span className="text-xs font-body text-white/30">{total} items</span>
                </div>

                {/* Servings scaler */}
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <Users className="h-3.5 w-3.5 text-white/30 shrink-0" />
                  <span className="text-xs font-body text-white/40 flex-1">Servings</span>
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.12] transition-all flex items-center justify-center text-sm font-bold"
                  >−</button>
                  <span className="font-display text-sm font-bold text-white w-5 text-center tabular-nums">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings((s) => Math.min(99, s + 1))}
                    className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.12] transition-all flex items-center justify-center text-sm font-bold"
                  >+</button>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mt-3">
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                        style={{ boxShadow: '0 0 8px rgba(249,115,22,0.5)' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    {checkedCount > 0 && (
                      <p className="text-[10px] font-body text-white/20 mt-1">Tap to mark as prepped</p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-1.5 flex-1">
                {recipe.ingredients.map((ing, i) => {
                  const done    = checked.has(i)
                  const display = scaleText(ing, scaleFactor)
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggleIngredient(i)}
                        className={`group flex items-start gap-3 w-full text-left rounded-xl px-2 py-1.5 transition-all duration-250 hover:bg-white/[0.04] ${done ? 'opacity-45' : ''}`}
                      >
                        <span className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${done ? 'bg-brand-500/40 border-brand-400/60' : 'border-white/20 group-hover:border-white/35'}`}>
                          <AnimatePresence>
                            {done && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Check className="h-2.5 w-2.5 text-brand-300" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </span>
                        <span className={`text-sm font-body leading-snug transition-all duration-200 ${done ? 'line-through decoration-brand-500/60 text-white/30' : 'text-white/65'}`}>
                          {display}
                          {scaleFactor !== 1 && (
                            <span className="ml-1 text-[10px] text-brand-400/50 font-mono">
                              ×{scaleFactor.toFixed(1).replace('.0', '')}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {checkedCount === total && total > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                  <p className="text-xs font-body text-emerald-300">✓ All ingredients prepped!</p>
                </motion.div>
              )}

              {/* Rating widget */}
              <div className="pt-2 border-t border-white/[0.06]">
                <RatingWidget recipeId={recipe.id} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Instructions */}
          <div className="md:col-span-2 space-y-6">
            {hasMixing && (
              <motion.div ref={mixingRef} custom={4} variants={fadeUp} initial="hidden" animate="visible">
                <GlassCard className="p-6">
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white mb-5">
                    <CheckSquare className="h-5 w-5 text-brand-400" />
                    Mixing Instructions
                  </h2>
                  <ol className="space-y-4">
                    {mixingSteps.map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex gap-4 group"
                      >
                        <span className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-brand-500/15 border border-brand-400/25 text-brand-300 text-xs font-mono font-bold group-hover:bg-brand-500/25 group-hover:border-brand-400/50 transition-all duration-200">
                          {i + 1}
                        </span>
                        <p className="text-sm font-body text-white/60 leading-relaxed pt-0.5">{step}</p>
                      </motion.li>
                    ))}
                  </ol>
                </GlassCard>
              </motion.div>
            )}

            {hasCooking && (
              <motion.div ref={cookingRef} custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                      <FlameKindling className="h-5 w-5 text-brand-400" />
                      Cooking Instructions
                    </h2>
                    {recipe.cookTime && (
                      <div className="print:hidden">
                        <CookTimer suggestedMinutes={recipe.cookTime} />
                      </div>
                    )}
                  </div>
                  <ol className="space-y-4">
                    {cookSteps.map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex gap-4 group"
                      >
                        <span className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-orange-500/15 border border-orange-400/25 text-orange-300 text-xs font-mono font-bold group-hover:bg-orange-500/25 transition-all duration-200">
                          {i + 1}
                        </span>
                        <p className="text-sm font-body text-white/60 leading-relaxed pt-0.5">{step}</p>
                      </motion.li>
                    ))}
                  </ol>
                </GlassCard>
              </motion.div>
            )}

            {/* Chef's Tip */}
            {recipe.chefTip && (
              <motion.div custom={5.5} variants={fadeUp} initial="hidden" animate="visible">
                <GlassCard className="p-6 border-amber-400/15 bg-amber-500/[0.04]">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white mb-3">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    Chef&apos;s Tip
                  </h2>
                  <p className="text-sm font-body text-white/65 leading-relaxed">
                    {recipe.chefTip}
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Nutrition ── */}
        {hasNutrition && (
          <motion.div
            ref={nutritionRef}
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="print:hidden"
          >
            <NutritionCard nutrition={recipe.nutrition!} scaleFactor={scaleFactor} />
          </motion.div>
        )}

        {/* ── Related Recipes ── */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="pt-4 pb-8 print:hidden"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-10" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-white">More {recipe.category}</h2>
              <a href="/" className="text-xs font-body text-brand-400/60 hover:text-brand-400 transition-colors">
                View all →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r, i) => (
                <RecipeCard key={r.id} recipe={r} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    </>
  )
}
