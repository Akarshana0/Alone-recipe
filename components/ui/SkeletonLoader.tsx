'use client'

import { cn } from '@/lib/utils'

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-white/[0.06]',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent',
        'after:animate-[shimmer_1.6s_infinite]',
        className,
      )}
    />
  )
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      {/* Media area */}
      <Shimmer className="h-52 w-full rounded-none" />
      {/* Content area */}
      <div className="p-5 flex flex-col gap-3">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <div className="flex gap-2 mt-1">
          <Shimmer className="h-6 w-20 rounded-full" />
          <Shimmer className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Shimmer className="h-10 w-2/3" />
      <Shimmer className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
        <Shimmer className="h-4 w-4/6" />
      </div>
    </div>
  )
}
