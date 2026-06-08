'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useParams, useRouter } from 'next/navigation'
import type { Recipe } from '@/types/recipe'
import RecipeForm from '@/components/RecipeForm'
import Button from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [recipe,  setRecipe]  = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'recipes', id))
      .then((snap) => {
        if (!snap.exists()) { setError(true); return }
        setRecipe({ id: snap.id, ...snap.data() } as Recipe)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="h-8 w-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center px-4">
        <span className="text-5xl">🚫</span>
        <p className="font-display text-2xl text-white/40">Recipe not found</p>
        <Button variant="glass" onClick={() => router.push('/admin')}>
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Button>
      </div>
    )
  }

  return <RecipeForm mode="edit" initialData={recipe} />
}
