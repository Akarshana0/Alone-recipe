'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'alone_recipe_ratings'

function loadRatings(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useRating(recipeId: string) {
  const [rating,   setRatingState] = useState<number>(0)
  const [hydrated, setHydrated]    = useState(false)

  useEffect(() => {
    const ratings = loadRatings()
    setRatingState(ratings[recipeId] ?? 0)
    setHydrated(true)
  }, [recipeId])

  const setRating = useCallback(
    (stars: number) => {
      setRatingState(stars)
      const ratings = loadRatings()
      if (stars === 0) delete ratings[recipeId]
      else             ratings[recipeId] = stars
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
    },
    [recipeId],
  )

  return { rating, setRating, hydrated }
}
