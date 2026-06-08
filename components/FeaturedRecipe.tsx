'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Clock, ArrowRight, ChefHat, Users } from 'lucide-react'
import type { Recipe } from '@/types/recipe'
import { DIFFICULTY_COLORS } from '@/types/recipe'
import { cn } from '@/lib/utils'

interface FeaturedRecipeProps {
  recipe: Recipe
}

export default function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const totalTime = (recipe.cookTime ?? 0) + (recipe.prepTime ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
        <span className="text-[10px] font-body text-white/30 uppercase tracking-widest">Featured Recipe</span>
      </div>

      <Link href={`/recipe/${recipe.id}`} className="block group">
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] group-hover:border-brand-500/35 shadow-glass-lg transition-all duration-400 group-hover:shadow-[0_28px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(249,115,22,0.12)]">

          {/* Cover image */}
          <div className="relative h-72 sm:h-[340px] overflow-hidden">
            {recipe.mediaUrl && recipe.mediaType === 'image' ? (
              <Image
                src={recipe.mediaUrl}
                alt={recipe.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-white/[0.02]">
                <ChefHat className="h-28 w-28 text-white/[0.05]" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent" />

            {/* Animated top shine on hover */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            {/* Bottom content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-body font-semibold bg-brand-500/30 border border-brand-400/45 text-brand-200">
                  {recipe.category}
                </span>
                {recipe.difficulty && (
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border backdrop-blur-sm',
                    DIFFICULTY_COLORS[recipe.difficulty],
                  )}>
                    {recipe.difficulty}
                  </span>
                )}
                {totalTime > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body bg-black/50 border border-white/10 text-white/60 backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> {totalTime}m
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body bg-black/50 border border-white/10 text-white/50 backdrop-blur-sm">
                    <Users className="h-3 w-3" /> {recipe.servings}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-2 group-hover:text-brand-50 transition-colors duration-200 line-clamp-2">
                {recipe.title}
              </h2>

              {/* Note */}
              <p className="text-sm sm:text-base font-body text-white/55 max-w-2xl leading-relaxed mb-5 line-clamp-2">
                {recipe.shortNote}
              </p>

              {/* CTA */}
              <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-brand-400 group-hover:text-brand-300 transition-colors duration-200 w-fit">
                View Recipe
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-250" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
