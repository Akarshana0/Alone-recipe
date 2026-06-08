import { Timestamp } from 'firebase/firestore'

export type MediaType = 'image' | 'video'

export type Category =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Desserts'
  | 'Snacks'
  | 'Drinks'
  | 'Vegan'
  | 'Quick Meals'
  | 'All'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'quick'

export interface Nutrition {
  calories?: number
  protein?:  number
  carbs?:    number
  fat?:      number
  fiber?:    number
}

export interface Recipe {
  id: string
  title: string
  shortNote: string
  mediaUrl: string
  mediaType: MediaType
  ingredients: string[]
  mixingInstructions: string
  cookingInstructions: string
  category: Category
  createdAt: Timestamp | Date | null
  // ── v2 fields ─────────────────────────────────────────────────
  cookTime?:   number
  prepTime?:   number
  servings?:   number
  difficulty?: Difficulty
  tags?:       string[]
  // ── v3 fields ─────────────────────────────────────────────────
  chefTip?:    string
  nutrition?:  Nutrition
  isFeatured?: boolean
}

export type RecipeFormData = Omit<Recipe, 'id' | 'createdAt'>

export const CATEGORIES: Category[] = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Snacks',
  'Drinks',
  'Vegan',
  'Quick Meals',
]

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy:   'text-emerald-300 bg-emerald-500/10 border-emerald-400/25',
  Medium: 'text-amber-300   bg-amber-500/10   border-amber-400/25',
  Hard:   'text-rose-300    bg-rose-500/10    border-rose-400/25',
}
