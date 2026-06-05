// src/components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="recipe-card rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="h-56 skeleton" />
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="h-6 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-2/3" />
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <div className="h-3 skeleton rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}
