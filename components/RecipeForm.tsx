'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection, addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowLeft, Save, Clock, Users, BarChart3, Tag as TagIcon, Lightbulb, Star, Apple } from 'lucide-react'
import type { Recipe, RecipeFormData, Category, Difficulty, Nutrition } from '@/types/recipe'
import { CATEGORIES, DIFFICULTIES, DIFFICULTY_COLORS } from '@/types/recipe'
import GlassCard from '@/components/ui/GlassCard'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import DragDropUpload from '@/components/DragDropUpload'
import { cn } from '@/lib/utils'

interface RecipeFormProps {
  initialData?: Recipe
  mode:         'new' | 'edit'
}

const EMPTY: RecipeFormData = {
  title:               '',
  shortNote:           '',
  mediaUrl:            '',
  mediaType:           'image',
  ingredients:         [''],
  mixingInstructions:  '',
  cookingInstructions: '',
  category:            'Dinner',
  cookTime:            undefined,
  prepTime:            undefined,
  servings:            undefined,
  difficulty:          undefined,
  tags:                [],
  chefTip:             undefined,
  nutrition:           undefined,
  isFeatured:          false,
}

export default function RecipeForm({ initialData, mode }: RecipeFormProps) {
  const router = useRouter()

  const fromInitial = (d: Recipe): RecipeFormData => ({
    title:               d.title,
    shortNote:           d.shortNote,
    mediaUrl:            d.mediaUrl,
    mediaType:           d.mediaType,
    ingredients:         d.ingredients,
    mixingInstructions:  d.mixingInstructions,
    cookingInstructions: d.cookingInstructions,
    category:            d.category,
    cookTime:            d.cookTime,
    prepTime:            d.prepTime,
    servings:            d.servings,
    difficulty:          d.difficulty,
    tags:                d.tags ?? [],
    chefTip:             d.chefTip,
    nutrition:           d.nutrition,
    isFeatured:          d.isFeatured ?? false,
  })

  const [form,   setForm]   = useState<RecipeFormData>(initialData ? fromInitial(initialData) : EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeFormData, string>>>({})
  const [tagInput, setTagInput] = useState('')

  function set<K extends keyof RecipeFormData>(key: K, value: RecipeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function setIngredient(idx: number, val: string) {
    const next = [...form.ingredients]; next[idx] = val; set('ingredients', next)
  }
  function addIngredient()    { set('ingredients', [...form.ingredients, '']) }
  function removeIngredient(i: number) {
    if (form.ingredients.length <= 1) return
    set('ingredients', form.ingredients.filter((_, idx) => idx !== i))
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || (form.tags ?? []).includes(tag)) return
    set('tags', [...(form.tags ?? []), tag])
    setTagInput('')
  }
  function removeTag(t: string) { set('tags', (form.tags ?? []).filter((x) => x !== t)) }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.title.trim())               e.title               = 'Title is required.'
    if (!form.shortNote.trim())           e.shortNote           = 'Short note is required.'
    if (!form.cookingInstructions.trim()) e.cookingInstructions = 'Cooking instructions are required.'
    if (form.ingredients.every((i) => !i.trim())) e.ingredients = 'Add at least one ingredient.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...form,
      ingredients: form.ingredients.filter((i) => i.trim()),
      tags: (form.tags ?? []).filter(Boolean),
    }
    try {
      if (mode === 'new') {
        await addDoc(collection(db, 'recipes'), { ...payload, createdAt: serverTimestamp() })
        toast.success('Recipe created! 🎉')
      } else if (initialData) {
        await updateDoc(doc(db, 'recipes', initialData.id), payload)
        toast.success('Recipe updated.')
      }
      router.push('/admin')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectClass = cn(
    'w-full h-11 px-4 rounded-xl border border-white/[0.13] bg-white/[0.06] backdrop-blur-sm',
    'text-white font-body text-sm outline-none',
    'focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20',
    'transition-all duration-200',
    '[&>option]:bg-[#0f0f14] [&>option]:text-white',
  )

  const numInputClass = cn(
    'w-full h-11 px-4 rounded-xl border border-white/[0.13] bg-white/[0.06] backdrop-blur-sm',
    'text-white font-body text-sm outline-none placeholder:text-white/25',
    'focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20',
    'transition-all duration-200',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="font-display text-3xl font-bold text-white mt-3">
            {mode === 'new' ? 'New Recipe' : 'Edit Recipe'}
          </h1>
        </div>
        <Button type="submit" variant="primary" size="lg" loading={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : mode === 'new' ? 'Publish Recipe' : 'Save Changes'}
        </Button>
      </div>

      {/* Basic Info */}
      <GlassCard className="p-6 space-y-5">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest">Basic Information</h2>

        <Input
          id="title" label="Recipe Title"
          placeholder="e.g. Creamy Mushroom Risotto"
          value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title}
        />

        <Textarea
          id="shortNote" label="Short Note / Description"
          placeholder="A brief, enticing description…"
          value={form.shortNote} onChange={(e) => set('shortNote', e.target.value)}
          error={errors.shortNote} rows={3}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value as Category)} className={selectClass}>
            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* ── NEW: Recipe Details ── */}
      <GlassCard className="p-6 space-y-5">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest">Recipe Details</h2>

        {/* Times + Servings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Prep Time (min)
            </label>
            <input
              type="number" min={0} placeholder="e.g. 15"
              value={form.prepTime ?? ''}
              onChange={(e) => set('prepTime', e.target.value ? parseInt(e.target.value) : undefined)}
              className={numInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Cook Time (min)
            </label>
            <input
              type="number" min={0} placeholder="e.g. 30"
              value={form.cookTime ?? ''}
              onChange={(e) => set('cookTime', e.target.value ? parseInt(e.target.value) : undefined)}
              className={numInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Servings
            </label>
            <input
              type="number" min={1} placeholder="e.g. 4"
              value={form.servings ?? ''}
              onChange={(e) => set('servings', e.target.value ? parseInt(e.target.value) : undefined)}
              className={numInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" /> Difficulty
            </label>
            <select
              value={form.difficulty ?? ''}
              onChange={(e) => set('difficulty', (e.target.value as Difficulty) || undefined)}
              className={selectClass}
            >
              <option value="">Not set</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty preview */}
        {form.difficulty && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 font-body">Preview:</span>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border', DIFFICULTY_COLORS[form.difficulty])}>
              {form.difficulty}
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
            <TagIcon className="h-3 w-3" /> Tags
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
              }}
              placeholder="e.g. spicy, one-pot, gluten-free — press Enter to add"
              className={cn(numInputClass, 'flex-1')}
            />
            <Button type="button" variant="glass" size="sm" onClick={() => addTag(tagInput)}>
              Add
            </Button>
          </div>
          {(form.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(form.tags ?? []).map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/50 text-xs font-body">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-white/30 hover:text-red-400 transition-colors ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Media */}
      <GlassCard className="p-6">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest mb-5">Media</h2>
        <DragDropUpload
          currentUrl={form.mediaUrl || undefined}
          currentType={form.mediaType}
          onUploadComplete={(url, type) => { set('mediaUrl', url); set('mediaType', type) }}
        />
      </GlassCard>

      {/* Ingredients */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest">Ingredients</h2>
          <span className="text-xs text-white/25">{form.ingredients.filter(Boolean).length} added</span>
        </div>
        {errors.ingredients && <p className="text-xs text-red-400">{errors.ingredients}</p>}
        <div className="space-y-2.5">
          {form.ingredients.map((ing, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-brand-500/15 text-brand-400 text-xs font-mono font-bold border border-brand-400/20">{i + 1}</span>
              <input
                type="text" value={ing}
                onChange={(e) => setIngredient(i, e.target.value)}
                placeholder={`Ingredient ${i + 1}… (include quantity, e.g. "2 cups flour")`}
                className={cn(
                  'flex-1 h-10 px-4 rounded-xl border border-white/[0.12] bg-white/[0.05]',
                  'text-white placeholder:text-white/25 font-body text-sm outline-none',
                  'focus:border-brand-400/50 focus:bg-white/[0.09] transition-all duration-200',
                )}
              />
              <button
                type="button" onClick={() => removeIngredient(i)}
                disabled={form.ingredients.length <= 1}
                className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-white/20 font-body">💡 Include quantities (e.g. "2 cups flour") for the servings scaler to work on the recipe page.</p>
        <Button type="button" variant="glass" size="sm" onClick={addIngredient}>
          <Plus className="h-4 w-4" /> Add Ingredient
        </Button>
      </GlassCard>

      {/* Instructions */}
      <GlassCard className="p-6 space-y-5">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest">Instructions</h2>
        <Textarea
          id="mixing" label="Mixing Instructions"
          placeholder={"Step 1: Combine flour and sugar.\nStep 2: Add eggs and mix until smooth.\n..."}
          value={form.mixingInstructions} onChange={(e) => set('mixingInstructions', e.target.value)} rows={6}
        />
        <Textarea
          id="cooking" label="Cooking Instructions"
          placeholder={"Step 1: Preheat oven to 180°C.\nStep 2: Bake for 30 minutes.\n..."}
          value={form.cookingInstructions} onChange={(e) => set('cookingInstructions', e.target.value)}
          error={errors.cookingInstructions} rows={6}
        />
        <p className="text-xs text-white/25 font-body">💡 Each new line becomes a separate numbered step.</p>
      </GlassCard>

      {/* Chef's Tip */}
      <GlassCard className="p-6 space-y-4 border-amber-400/10">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400/60" /> Chef&apos;s Tip (optional)
        </h2>
        <Textarea
          id="chefTip"
          label=""
          placeholder="Share a pro tip, substitution idea, or serving suggestion…"
          value={form.chefTip ?? ''}
          onChange={(e) => set('chefTip', e.target.value || undefined)}
          rows={3}
        />
      </GlassCard>

      {/* Nutrition */}
      <GlassCard className="p-6 space-y-5">
        <h2 className="text-xs font-body font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Apple className="h-3.5 w-3.5 text-emerald-400/60" /> Nutrition per Serving (optional)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {([
            { key: 'calories', label: 'Calories', unit: 'kcal' },
            { key: 'protein',  label: 'Protein',  unit: 'g'    },
            { key: 'carbs',    label: 'Carbs',    unit: 'g'    },
            { key: 'fat',      label: 'Fat',      unit: 'g'    },
            { key: 'fiber',    label: 'Fiber',    unit: 'g'    },
          ] as const).map(({ key, label, unit }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                {label} <span className="text-white/20 normal-case">({unit})</span>
              </label>
              <input
                type="number" min={0} placeholder="—"
                value={form.nutrition?.[key] ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined
                  const next: Nutrition = { ...(form.nutrition ?? {}), [key]: val }
                  set('nutrition', Object.values(next).some((v) => v != null) ? next : undefined)
                }}
                className={numInputClass}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Featured toggle */}
      <GlassCard className="p-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-amber-400/70" />
            <div>
              <p className="text-sm font-body font-medium text-white/80">Feature this recipe</p>
              <p className="text-xs font-body text-white/30 mt-0.5">Show as the featured recipe spotlight on the homepage</p>
            </div>
          </div>
          <div
            onClick={() => set('isFeatured', !form.isFeatured)}
            className={cn(
              'relative w-11 h-6 rounded-full border transition-all duration-300 cursor-pointer',
              form.isFeatured
                ? 'bg-amber-500/25 border-amber-400/50'
                : 'bg-white/[0.06] border-white/[0.12]',
            )}
          >
            <div className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-300',
              form.isFeatured
                ? 'left-[calc(100%-1.375rem)] bg-amber-400'
                : 'left-0.5 bg-white/30',
            )} />
          </div>
        </label>
      </GlassCard>

      {/* Mobile save */}
      <div className="pb-4">
        <Button type="submit" variant="primary" size="lg" loading={saving} className="w-full sm:hidden">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : mode === 'new' ? 'Publish Recipe' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
