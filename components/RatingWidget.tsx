'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRating } from '@/hooks/useRating'

const LABELS = ['', 'Not for me', 'It was okay', 'Liked it!', 'Really good!', 'Absolute banger! 🔥']

interface RatingWidgetProps {
  recipeId: string
}

export default function RatingWidget({ recipeId }: RatingWidgetProps) {
  const { rating, setRating, hydrated } = useRating(recipeId)
  const [hovered, setHovered] = useState(0)

  if (!hydrated) return null

  const display = hovered || rating

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-body text-white/30 uppercase tracking-widest">Your rating</p>

      <div
        className="flex items-center gap-1.5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => setRating(rating === star ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            className="focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-all duration-150',
                star <= display
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                  : 'text-white/20 hover:text-white/40',
              )}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {display > 0 && (
          <motion.p
            key={display}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-body text-amber-400/80"
          >
            {LABELS[display]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
