'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChefHat, Shuffle, Trash2, ArrowLeft, Clock, ShoppingCart, Check, Copy, X } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import type { Recipe } from '@/types/recipe'
import { toast } from 'sonner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const
type MealType = typeof MEALS[number]
type Plan = Record<string, Record<MealType, Recipe | null>>

const STORAGE_KEY = 'alone-meal-plan-v1'

function buildEmpty(): Plan {
  return Object.fromEntries(DAYS.map(d => [d, { Breakfast: null, Lunch: null, Dinner: null }]))
}
function loadPlan(): Plan {
  if (typeof window === 'undefined') return buildEmpty()
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : buildEmpty() }
  catch { return buildEmpty() }
}

export default function MealPlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [plan, setPlan] = useState<Plan>(buildEmpty())
  const [loading, setLoading] = useState(true)
  const [picker, setPicker] = useState<{ day: string; meal: MealType } | null>(null)
  const [search, setSearch] = useState('')
  const [shoppingOpen, setShoppingOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPlan(loadPlan())
    getDocs(query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))).then(snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)))
      setLoading(false)
    })
  }, [])

  const savePlan = useCallback((p: Plan) => {
    setPlan(p)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch {}
  }, [])

  const assign = useCallback((recipe: Recipe) => {
    if (!picker) return
    savePlan({ ...plan, [picker.day]: { ...plan[picker.day], [picker.meal]: recipe } })
    setPicker(null); setSearch('')
    toast.success(`${recipe.title} → ${picker.day} ${picker.meal}`)
  }, [picker, plan, savePlan])

  const remove = useCallback((day: string, meal: MealType) => {
    savePlan({ ...plan, [day]: { ...plan[day], [meal]: null } })
  }, [plan, savePlan])

  const randomize = useCallback(() => {
    if (!recipes.length) return
    const newPlan = buildEmpty()
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const pool = recipes.filter(r => meal === 'Breakfast' ? r.category === 'Breakfast' : meal === 'Dinner' ? ['Dinner', 'Lunch'].includes(r.category) : true)
        newPlan[day][meal] = (pool.length ? pool : recipes)[Math.floor(Math.random() * (pool.length || recipes.length))]
      }
    }
    savePlan(newPlan); toast.success('Week auto-filled!')
  }, [recipes, savePlan])

  const shoppingList = useMemo(() => {
    const map = new Map<string, number>()
    DAYS.forEach(d => MEALS.forEach(m => { plan[d][m]?.ingredients.forEach(ing => map.set(ing, (map.get(ing) || 0) + 1)) }))
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [plan])

  const copyList = async () => {
    await navigator.clipboard.writeText(shoppingList.map(([i]) => `• ${i}`).join('\n'))
    setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Shopping list copied!')
  }

  const totalMeals = DAYS.reduce((acc, d) => acc + MEALS.filter(m => plan[d][m]).length, 0)
  const filtered = recipes.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-body text-white/35 hover:text-white/65 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> All Recipes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-violet-400" />
              </div>
              <h1 className="font-display text-4xl font-bold text-white">Meal Planner</h1>
            </div>
            <p className="text-sm font-body text-white/30">{totalMeals} of {DAYS.length * MEALS.length} meals planned</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShoppingOpen(true)} disabled={!shoppingList.length} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-sm font-body font-medium transition-all disabled:opacity-30">
              <ShoppingCart className="h-4 w-4" /> Shopping List {shoppingList.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] font-mono">{shoppingList.length}</span>}
            </button>
            <button onClick={randomize} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 text-sm font-body font-medium transition-all disabled:opacity-30">
              <Shuffle className="h-4 w-4" /> Auto-fill
            </button>
            <button onClick={() => savePlan(buildEmpty())} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.09] bg-white/[0.04] text-white/35 hover:text-white/65 text-sm font-body font-medium transition-all">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mb-8 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-violet-500 to-brand-500 rounded-full" animate={{ width: `${(totalMeals / (DAYS.length * MEALS.length)) * 100}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS.map((day, di) => (
          <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.05 }} className="space-y-2">
            <div className="px-2 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <p className="text-xs font-display font-bold text-white/70 text-center">{day.slice(0, 3).toUpperCase()}</p>
            </div>
            {MEALS.map(meal => {
              const recipe = plan[day][meal]
              return (
                <div key={meal}>
                  <p className="text-[9px] font-body text-white/20 uppercase tracking-widest mb-1 px-0.5">{meal}</p>
                  {recipe ? (
                    <motion.div layout className="relative group rounded-xl bg-white/[0.05] border border-white/[0.09] hover:border-brand-400/30 p-2.5 transition-all cursor-default">
                      <button onClick={() => remove(day, meal)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500/80 border border-rose-400/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <X className="h-2.5 w-2.5 text-white" />
                      </button>
                      <p className="text-xs font-body font-semibold text-white/80 line-clamp-2 leading-tight">{recipe.title}</p>
                      {(recipe.cookTime || recipe.prepTime) && (
                        <p className="flex items-center gap-1 text-[9px] font-body text-white/25 mt-1"><Clock className="h-2.5 w-2.5" />{(recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)}m</p>
                      )}
                    </motion.div>
                  ) : (
                    <button onClick={() => setPicker({ day, meal })} className="w-full rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] hover:border-brand-400/30 hover:bg-brand-500/5 transition-all p-2.5 text-center">
                      <span className="text-[10px] font-body text-white/20 hover:text-brand-400/60">+ Add</span>
                    </button>
                  )}
                </div>
              )
            })}
          </motion.div>
        ))}
      </div>

      {/* Recipe Picker */}
      <AnimatePresence>
        {picker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setPicker(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#0c0c16]/98 border border-white/[0.12] rounded-3xl shadow-glass-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div>
                  <p className="font-display text-base font-bold text-white">{picker.day} · {picker.meal}</p>
                  <p className="text-xs text-white/30 font-body">Pick a recipe</p>
                </div>
                <button onClick={() => setPicker(null)} className="text-white/30 hover:text-white/70 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 border-b border-white/[0.06]">
                <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-body placeholder:text-white/25 outline-none focus:border-brand-400/40" autoFocus />
              </div>
              <div className="overflow-y-auto max-h-80 p-3 space-y-1.5">
                {filtered.map(r => (
                  <button key={r.id} onClick={() => assign(r)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-brand-400/25 transition-all text-left">
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 border border-brand-400/15 flex items-center justify-center shrink-0"><ChefHat className="h-4 w-4 text-brand-400/70" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold text-white/80 truncate">{r.title}</p>
                      <p className="text-[10px] font-body text-white/30">{r.category} · {(r.prepTime ?? 0) + (r.cookTime ?? 0)}m</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping List */}
      <AnimatePresence>
        {shoppingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShoppingOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative w-full max-w-md bg-[#0c0c16]/98 border border-white/[0.12] rounded-3xl shadow-glass-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center"><ShoppingCart className="h-4 w-4 text-emerald-400" /></div>
                  <div><p className="font-display text-base font-bold text-white">Shopping List</p><p className="text-xs text-white/30 font-body">{shoppingList.length} ingredients</p></div>
                </div>
                <button onClick={() => setShoppingOpen(false)} className="text-white/30 hover:text-white/70 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-y-auto max-h-96 p-4 space-y-1.5">
                {shoppingList.map(([ing]) => (
                  <div key={ing} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                    <span className="text-sm font-body text-white/70">{ing}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/[0.07]">
                <button onClick={copyList} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-sm font-body font-semibold">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
