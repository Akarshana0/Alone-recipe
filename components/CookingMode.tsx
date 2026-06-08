'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, CheckCircle2, Circle, ChefHat, Utensils, FlameKindling, Maximize2 } from 'lucide-react'
import type { Recipe } from '@/types/recipe'
import CookTimer from './CookTimer'

interface CookingModeProps {
  recipe: Recipe
  onClose: () => void
}

export default function CookingMode({ recipe, onClose }: CookingModeProps) {
  // Parse steps from cookingInstructions
  const rawSteps = recipe.cookingInstructions
    .split(/\n+/)
    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean)

  const mixSteps = recipe.mixingInstructions
    ? recipe.mixingInstructions.split(/\n+/).map(s => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
    : []

  const allSteps = [
    ...(recipe.ingredients.length > 0 ? [{ type: 'ingredients' as const, content: recipe.ingredients }] : []),
    ...mixSteps.map(s => ({ type: 'step' as const, content: s, phase: 'Mixing' })),
    ...rawSteps.map(s => ({ type: 'step' as const, content: s, phase: 'Cooking' })),
  ]

  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const next = () => setCurrent(c => Math.min(allSteps.length - 1, c + 1))
  const toggleDone = (i: number) => setDone(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const step = allSteps[current]
  const progress = ((current) / (allSteps.length - 1)) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-[#050508] flex flex-col"
    >
      {/* Progress bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/[0.06]">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-brand-500/15 border border-brand-400/25 flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{recipe.title}</p>
            <p className="text-[10px] font-body text-white/25 uppercase tracking-wider">
              Step {current + 1} of {allSteps.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CookTimer suggestedMinutes={recipe.cookTime ?? 15} />
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl"
          >
            {step.type === 'ingredients' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Ingredients</h2>
                    <p className="text-sm text-white/30 font-body">Gather everything before you start</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDone(i + 1000)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        done.has(i + 1000)
                          ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300/60 line-through'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:border-white/[0.14]'
                      }`}
                    >
                      {done.has(i + 1000)
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        : <Circle className="h-4 w-4 text-white/20 shrink-0" />}
                      <span className="text-sm font-body">{ing}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Phase label */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                    step.phase === 'Mixing'
                      ? 'bg-blue-500/15 border border-blue-400/25'
                      : 'bg-brand-500/15 border border-brand-400/25'
                  }`}>
                    {step.phase === 'Mixing'
                      ? <Utensils className="h-5 w-5 text-blue-400" />
                      : <FlameKindling className="h-5 w-5 text-brand-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-body text-white/30 uppercase tracking-widest">{step.phase ?? 'Step'}</p>
                    <p className="font-display text-xl font-bold text-white">Step {current}</p>
                  </div>
                </div>

                {/* Big step text */}
                <p className="font-body text-xl sm:text-2xl text-white/85 leading-relaxed">
                  {step.content}
                </p>

                {/* Chef tip */}
                {recipe.chefTip && current === allSteps.length - 1 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20">
                    <p className="text-xs font-body text-amber-400/60 uppercase tracking-widest mb-1">Chef's Tip</p>
                    <p className="text-sm font-body text-amber-200/80">{recipe.chefTip}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav controls */}
      <div className="flex items-center justify-between px-6 py-6 border-t border-white/[0.07]">
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.09] text-white/50 hover:text-white/80 hover:bg-white/[0.09] transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed font-body text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {allSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current ? 'w-4 h-2 bg-brand-400' : 'w-2 h-2 bg-white/[0.15] hover:bg-white/[0.3]'
              }`}
            />
          ))}
        </div>

        {current < allSteps.length - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500/20 border border-brand-400/40 text-brand-200 hover:bg-brand-500/30 hover:border-brand-400/60 transition-all duration-200 font-body text-sm font-semibold"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition-all duration-200 font-body text-sm font-semibold"
          >
            <CheckCircle2 className="h-4 w-4" />
            Done!
          </button>
        )}
      </div>
    </motion.div>
  )
}
