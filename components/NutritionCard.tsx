import type { Nutrition } from '@/types/recipe'
import { Flame, Dumbbell, Wheat, Droplets, Leaf } from 'lucide-react'
import GlassCard from './ui/GlassCard'

interface NutritionCardProps {
  nutrition:   Nutrition
  scaleFactor?: number
}

const MACRO_ITEMS = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', icon: Flame,    color: 'text-orange-400',  bg: 'bg-orange-500/10'  },
  { key: 'protein'  as const, label: 'Protein',  unit: 'g',    icon: Dumbbell, color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { key: 'carbs'    as const, label: 'Carbs',    unit: 'g',    icon: Wheat,    color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  { key: 'fat'      as const, label: 'Fat',      unit: 'g',    icon: Droplets, color: 'text-rose-400',    bg: 'bg-rose-500/10'    },
  { key: 'fiber'    as const, label: 'Fiber',    unit: 'g',    icon: Leaf,     color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
]

export default function NutritionCard({ nutrition, scaleFactor = 1 }: NutritionCardProps) {
  const visible = MACRO_ITEMS.filter((item) => nutrition[item.key] != null)
  if (visible.length === 0) return null

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-body text-white/35 uppercase tracking-widest">Nutrition</h3>
        <span className="text-[10px] font-body text-white/20">per serving</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {visible.map(({ key, label, unit, icon: Icon, color, bg }) => {
          const raw = nutrition[key]!
          const val = scaleFactor !== 1 ? Math.round(raw * scaleFactor) : raw
          return (
            <div
              key={key}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border border-white/[0.07] ${bg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="font-display text-xl font-bold text-white tabular-nums">{val}</span>
              <span className="text-[9px] font-body text-white/35 uppercase tracking-wide">{label}</span>
              <span className="text-[9px] font-mono text-white/20">{unit}</span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
