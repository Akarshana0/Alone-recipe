"use client";
// src/components/RecipeCard.tsx
import Link from "next/link";
import Image from "next/image";
import { useRef, MouseEvent } from "react";
import { Play, Clock, ArrowUpRight } from "lucide-react";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

export default function RecipeCard({ recipe, index }: RecipeCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 7;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="recipe-card rounded-2xl overflow-hidden opacity-0 animate-fade-up"
        style={{
          animationDelay: `${index * 0.075}s`,
          animationFillMode: "forwards",
          transition: "transform 0.15s ease, background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease",
          willChange: "transform",
        }}
      >
        {/* ── Thumbnail ─────────────────────────────────────────── */}
        <div className="relative h-56 overflow-hidden bg-obsidian-900">
          {recipe.mediaUrl ? (
            recipe.mediaType === "video" ? (
              <div className="relative w-full h-full">
                <video
                  src={recipe.mediaUrl}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  muted
                  preload="metadata"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-obsidian-950/30">
                  <div className="w-12 h-12 rounded-full glass-amber flex items-center justify-center
                                  group-hover:scale-115 transition-all duration-400 glow-amber">
                    <Play className="w-5 h-5 text-amber-400 ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="glass px-2 py-1 rounded-md text-xs font-mono text-amber-400 tracking-wider">
                    VIDEO
                  </span>
                </div>
              </div>
            ) : (
              <Image
                src={recipe.mediaUrl}
                alt={recipe.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-108"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center
                            bg-gradient-to-br from-obsidian-800 to-obsidian-900 relative overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent" />
              </div>
              <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-400
                               inline-block">
                🍽️
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-28
                          bg-gradient-to-t from-obsidian-950/85 via-obsidian-950/20 to-transparent" />

          {/* Hover shine sweep */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none
                          transition-opacity duration-500 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                            transition-transform duration-700 ease-in-out
                            bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="p-5 relative z-10">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-display text-xl font-light text-cream-100
                           group-hover:text-amber-300 transition-colors duration-300 leading-tight">
              {recipe.title}
            </h2>
            <ArrowUpRight
              className="w-4 h-4 text-obsidian-500 group-hover:text-amber-400 flex-shrink-0 mt-1
                         transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>

          {/* Note */}
          <p className="text-sm text-obsidian-400 font-body font-light leading-relaxed line-clamp-2">
            {recipe.shortNote}
          </p>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-obsidian-500">
              <Clock className="w-3 h-3" />
              <span className="font-mono">
                {recipe.ingredients?.length || 0} ingredients
              </span>
            </div>
            {/* Animated bar */}
            <div className="h-px w-8 bg-gradient-to-r from-amber-400/50 to-transparent
                             group-hover:w-16 transition-all duration-500" />
          </div>
        </div>
      </article>
    </Link>
  );
}
