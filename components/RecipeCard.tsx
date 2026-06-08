'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat, Play, ArrowUpRight, Heart, Flame } from 'lucide-react'
import type { Recipe } from '@/types/recipe'
import { DIFFICULTY_COLORS } from '@/types/recipe'
import { cn } from '@/lib/utils'
import { useSaved } from '@/hooks/useSaved'

interface RecipeCardProps {
  recipe: Recipe
  index:  number
}

export default function RecipeCard({ recipe, index }: RecipeCardProps) {
  const cardRef              = useRef<HTMLDivElement>(null)
  const { isSaved, toggle } = useSaved()
  const saved               = isSaved(recipe.id)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
    const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
    el.style.transform = `perspective(800px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg) translateZ(8px)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }

  const totalTime = (recipe.cookTime ?? 0) + (recipe.prepTime ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/recipe/${recipe.id}`} className="block group" tabIndex={-1}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'relative rounded-2xl overflow-hidden glass-glint',
            'border border-white/[0.09] bg-white/[0.04]',
            'shadow-glass-sm',
            'transition-all duration-300 ease-out',
            'group-hover:border-brand-500/30 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(249,115,22,0.12)]',
          )}
          style={{ transition: 'transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease' }}
        >
          {/* ── Media ── */}
          <div className="relative h-52 overflow-hidden bg-white/[0.03]">
            {recipe.mediaUrl ? (
              recipe.mediaType === 'video' ? (
                <video
                  src={recipe.mediaUrl}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  muted playsInline preload="metadata"
                />
              ) : (
                <Image
                  src={recipe.mediaUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center">
                <ChefHat className="h-16 w-16 text-white/[0.07]" />
              </div>
            )}

            {/* Video play badge */}
            {recipe.mediaType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm border border-white/20 group-hover:scale-110 group-hover:border-brand-400/50 transition-all duration-300">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top shimmer */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category pill */}
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-body font-semibold bg-black/50 border border-white/10 text-white/80 backdrop-blur-sm group-hover:bg-brand-500/25 group-hover:border-brand-400/40 group-hover:text-brand-200 transition-all duration-300">
              {recipe.category}
            </span>

            {/* Save / Heart button */}
            <button
              onClick={(e) => toggle(recipe.id, e)}
              aria-label={saved ? 'Remove from saved' : 'Save recipe'}
              className={cn(
                'absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center backdrop-blur-sm border transition-all duration-300',
                saved
                  ? 'bg-rose-500/25 border-rose-400/50 text-rose-300'
                  : 'bg-black/50 border-white/10 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-rose-300 translate-x-2 group-hover:translate-x-0',
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', saved && 'fill-rose-300')} />
            </button>

            {/* Time + difficulty badges — bottom of image */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              {totalTime > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] font-body font-medium">
                  <Clock className="h-2.5 w-2.5" />
                  {totalTime}m
                </span>
              )}
              {recipe.difficulty && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full border text-[10px] font-body font-semibold backdrop-blur-sm bg-black/40',
                  DIFFICULTY_COLORS[recipe.difficulty],
                )}>
                  {recipe.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-brand-200 transition-colors duration-200">
              {recipe.title}
            </h3>
            <p className="mt-1.5 text-sm font-body text-white/45 line-clamp-2 leading-relaxed">
              {recipe.shortNote}
            </p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-white/30 font-body">
                <ChefHat className="h-3.5 w-3.5" />
                {recipe.ingredients.length} ingredients
                {recipe.servings && (
                  <span className="text-white/20">· {recipe.servings} servings</span>
                )}
              </span>
              <span className="flex items-center gap-1 text-xs font-body font-medium text-brand-500/60 group-hover:text-brand-400 transition-all duration-200 group-hover:gap-1.5">
                View Recipe
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </span>
            </div>
          </div>

          {/* Bottom glow */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl bg-gradient-to-tl from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}
