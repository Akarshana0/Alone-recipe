"use client";
// src/app/page.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getAllRecipes, searchRecipes } from "@/lib/recipeService";
import { Recipe } from "@/types/recipe";

// ── Floating particles ─────────────────────────────────────────────
const PARTICLES = [
  { size: 3,  top: "18%", left: "12%",  anim: "animate-particle-a", delay: "0s"    },
  { size: 2,  top: "35%", left: "88%",  anim: "animate-particle-b", delay: "1.2s"  },
  { size: 4,  top: "62%", left: "6%",   anim: "animate-particle-c", delay: "2.5s"  },
  { size: 2,  top: "78%", left: "92%",  anim: "animate-particle-d", delay: "0.5s"  },
  { size: 3,  top: "12%", left: "72%",  anim: "animate-particle-e", delay: "3.5s"  },
  { size: 2,  top: "50%", left: "48%",  anim: "animate-particle-f", delay: "1.8s"  },
  { size: 1.5,top: "88%", left: "32%",  anim: "animate-particle-a", delay: "4s"    },
  { size: 2.5,top: "25%", left: "55%",  anim: "animate-particle-d", delay: "2.2s"  },
];

// ── Animated word reveal for hero headline ─────────────────────────
function WordReveal({ words, className }: { words: string[]; className?: string }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <span
            className="inline-block opacity-0 animate-word-reveal"
            style={{ animationDelay: `${0.3 + i * 0.12}s`, animationFillMode: "forwards" }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// ── Animated recipe count ──────────────────────────────────────────
function RecipeCount({ count, loading }: { count: number; loading: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!loading && count > 0 && !animated) {
      setAnimated(true);
      let start = 0;
      const step = Math.ceil(count / 20);
      const timer = setInterval(() => {
        start = Math.min(start + step, count);
        setDisplayed(start);
        if (start >= count) clearInterval(timer);
      }, 40);
    }
  }, [count, loading, animated]);

  if (loading) return <span className="skeleton inline-block w-16 h-3 rounded" />;
  return (
    <span className="opacity-0 animate-count-pop" style={{ animationFillMode: "forwards" }}>
      {displayed} recipe{displayed !== 1 ? "s" : ""}
    </span>
  );
}

// ── Intersection observer hook ─────────────────────────────────────
function useRevealOnScroll(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

export default function HomePage() {
  const [recipes, setRecipes]     = useState<Recipe[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching]  = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  useRevealOnScroll(gridRef as React.RefObject<Element>);

  useEffect(() => {
    getAllRecipes().then(setRecipes).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setHasSearched(false);
      setSearching(true);
      const all = await getAllRecipes();
      setRecipes(all);
      setSearching(false);
      return;
    }
    setHasSearched(true);
    setSearching(true);
    const results = await searchRecipes(term);
    setRecipes(results);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (searchTerm !== "") handleSearch(searchTerm); }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-mesh">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">

          {/* Animated background grid */}
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

          {/* Morphing ambient blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[520px] h-[520px] pointer-events-none"
               style={{ zIndex: 0 }}>
            <div className="w-full h-full morph-blob animate-glow-pulse"
                 style={{ background: "radial-gradient(circle, rgba(251,191,36,0.055) 0%, transparent 70%)" }}
            />
          </div>

          {/* Decorative rings */}
          <div className="hero-ring w-[420px] h-[420px] top-1/2 left-1/2
                          -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-20" />
          <div className="hero-ring w-[640px] h-[640px] top-1/2 left-1/2
                          -translate-x-1/2 -translate-y-1/2 animate-spin-reverse opacity-10" />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`particle ${p.anim}`}
              style={{
                width: `${p.size}px`, height: `${p.size}px`,
                top: p.top, left: p.left,
                animationDelay: p.delay,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Label badge */}
            <div className="opacity-0 animate-scale-in stagger-1 mb-6"
                 style={{ animationFillMode: "forwards" }}>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full
                              border border-amber-400/15 hover:border-amber-400/30
                              transition-colors duration-300 cursor-default">
                <Sparkles className="w-3 h-3 text-amber-400 animate-glow-pulse" />
                <span className="text-xs font-mono tracking-[0.22em] uppercase text-obsidian-400">
                  Curated Collection
                </span>
              </div>
            </div>

            {/* Headline with word reveal */}
            <h1 className="text-center max-w-3xl">
              <span className="block font-display text-6xl sm:text-7xl lg:text-8xl font-light
                               text-cream-100 tracking-tight leading-none">
                <WordReveal words={["Discover"]} />
              </span>
              <span className="block font-display text-6xl sm:text-7xl lg:text-8xl font-light
                               italic text-gradient tracking-tight leading-none mt-1">
                <WordReveal words={["Great", "Recipes"]} />
              </span>
            </h1>

            {/* Decorative line under headline */}
            <div className="mt-5 h-px w-24 opacity-0 animate-draw-line stagger-6
                            bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
                 style={{ animationFillMode: "forwards" }} />

            {/* Subtext */}
            <p className="opacity-0 animate-fade-up-blur stagger-7 mt-6 text-center
                           text-obsidian-400 font-body font-light text-base max-w-md leading-relaxed"
               style={{ animationFillMode: "forwards" }}>
              A private collection of handcrafted recipes — each one perfected
              through time and devotion.
            </p>

            {/* Search bar */}
            <div className="opacity-0 animate-fade-up stagger-8 mt-10 w-full max-w-2xl"
                 style={{ animationFillMode: "forwards" }}>
              <div className="relative group">
                {/* Glow ring behind input */}
                <div className="absolute -inset-px rounded-2xl opacity-0
                                group-focus-within:opacity-100 transition-opacity duration-400
                                bg-gradient-to-r from-amber-400/25 via-transparent to-amber-600/25 blur-sm" />
                {/* Animated border */}
                <div className="absolute -inset-px rounded-2xl opacity-0
                                group-focus-within:opacity-100 transition-opacity duration-400
                                animate-border-glow" style={{ animationFillMode: "forwards" }} />

                <div className="relative flex items-center glass rounded-2xl
                                border border-white/[0.08]
                                group-focus-within:border-amber-400/35
                                transition-all duration-400
                                group-focus-within:shadow-[0_0_40px_rgba(251,191,36,0.06)]">
                  <Search className="absolute left-5 w-5 h-5 text-obsidian-500
                                     group-focus-within:text-amber-400 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search recipes by name or note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent py-5 pl-14 pr-6 text-cream-100
                               placeholder:text-obsidian-600 font-body font-light text-base
                               focus:outline-none"
                  />
                  {searching && (
                    <div className="absolute right-5 w-4 h-4 border-2 border-amber-400/30
                                    border-t-amber-400 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="opacity-0 animate-fade-in stagger-10 mt-12 flex flex-col items-center gap-2"
                 style={{ animationFillMode: "forwards" }}>
              <ChevronDown className="w-4 h-4 text-obsidian-600 animate-bounce" />
            </div>
          </div>
        </section>

        {/* ── Recipe Grid ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

          {/* Section header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              {hasSearched ? (
                <h2 className="font-display text-2xl font-light text-cream-200">
                  Results for{" "}
                  <span className="text-amber-400 italic">"{searchTerm}"</span>
                </h2>
              ) : (
                <h2 className="font-display text-2xl font-light text-cream-200">
                  All Recipes
                </h2>
              )}
              <p className="text-sm text-obsidian-500 font-mono mt-1">
                <RecipeCount count={recipes.length} loading={loading || searching} />
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-px w-24 bg-gradient-to-l from-amber-400/25 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/45 animate-glow-pulse" />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-20 h-20 rounded-3xl glass-amber flex items-center justify-center
                              glow-amber animate-float">
                <span className="text-3xl">🍽️</span>
              </div>
              <p className="font-display text-2xl font-light text-cream-200">
                {hasSearched ? "No recipes found" : "No recipes yet"}
              </p>
              <p className="text-sm text-obsidian-500 text-center max-w-xs">
                {hasSearched
                  ? `We couldn't find anything matching "${searchTerm}". Try a different search.`
                  : "The collection is empty. Check back soon."}
              </p>
              {hasSearched && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-amber-400 text-sm font-body hover:text-amber-300
                             transition-colors relative group"
                >
                  Clear search
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-amber-400/50
                                   group-hover:w-full transition-all duration-300" />
                </button>
              )}
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.04] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                          flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/20" />
              <p className="font-display text-sm text-obsidian-600 italic">
                ALONE recipes — made with devotion
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/20" />
            </div>
            <p className="font-mono text-xs text-obsidian-700">
              {new Date().getFullYear()}
            </p>
          </div>
        </footer>

      </main>
    </>
  );
}
