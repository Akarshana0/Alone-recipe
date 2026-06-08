'use client'

import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Bookmark, ChefHat, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import type { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'
import { RecipeGridSkeleton } from '@/components/ui/SkeletonLoader'
import { useSaved } from '@/hooks/useSaved'
import Button from '@/components/ui/Button'

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export default function SavedPage() {
  const { savedIds, hydrated } = useSaved()
  const [recipes, setRecipes]  = useState<Recipe[]>([])
  const [loading, setLoading]  = useState(true)

  const ids = useMemo(() => [...savedIds], [savedIds])

  useEffect(() => {
    if (!hydrated) return
    if (ids.length === 0) { setLoading(false); return }

    // Firestore `in` supports up to 30 items per query
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30))

    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, 'recipes'), where(documentId(), 'in', chunk))),
      ),
    ).then((snaps) => {
      const all: Recipe[] = []
      snaps.forEach((snap) =>
        snap.docs.forEach((d) => all.push({ id: d.id, ...d.data() } as Recipe)),
      )
      // Keep order consistent with savedIds
      setRecipes(ids.map((id) => all.find((r) => r.id === id)!).filter(Boolean))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, ids.join(',')])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pt-4 pb-10 flex flex-col gap-4"
      >
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> All Recipes
          </Button>
        </Link>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/15 border border-rose-400/25 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-rose-400 fill-rose-400/30" />
              </div>
              <h1 className="font-display text-4xl font-bold text-white">Saved Recipes</h1>
            </div>
            <p className="text-sm font-body text-white/35 ml-0.5">
              {!hydrated || loading
                ? 'Loading…'
                : recipes.length === 0
                ? 'No saved recipes yet'
                : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="mb-10 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Grid */}
      {!hydrated || loading ? (
        <RecipeGridSkeleton count={3} />
      ) : recipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-28 text-center"
        >
          <span className="text-7xl animate-float inline-block">🔖</span>
          <div className="space-y-2">
            <p className="font-display text-2xl text-white/25">No saved recipes yet</p>
            <p className="text-sm text-white/15 font-body max-w-xs leading-relaxed">
              Tap the ❤️ on any recipe card to save it here for quick access.
            </p>
          </div>
          <Link href="/">
            <Button variant="glass" size="lg">
              <ChefHat className="h-4 w-4" /> Browse Recipes
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
        >
          {recipes.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
