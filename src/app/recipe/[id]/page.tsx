"use client";
// src/app/recipe/[id]/page.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Copy, Check, ChefHat, Flame, List, Blend,
  Play, Pause, Volume2, VolumeX,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getRecipeById } from "@/lib/recipeService";
import { Recipe } from "@/types/recipe";

// ── Reading progress bar ───────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}

// ── Section component ──────────────────────────────────────────────
function Section({
  icon, label, children, index,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="section-card rounded-2xl p-6"
      style={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s,
                     transform 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg glass-amber flex items-center justify-center
                        text-amber-400 flex-shrink-0 animate-float"
             style={{ animationDelay: `${index * 0.3}s` }}>
          {icon}
        </div>
        <h2 className="font-display text-xl font-light text-cream-200">{label}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent
                        animate-draw-line"
             style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: "forwards",
                      transform: "scaleX(0)", transformOrigin: "left" }}
        />
      </div>
      {children}
    </div>
  );
}

// ── Animated ingredients list ──────────────────────────────────────
function IngredientsList({ ingredients }: { ingredients: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <ul ref={ref} className="space-y-2">
      {ingredients.map((ingredient, i) => (
        <li
          key={i}
          className="flex items-start gap-3 group/item ingredient-item"
          style={{
            animationDelay: visible ? `${i * 0.055}s` : "9999s",
            animationPlayState: visible ? "running" : "paused",
          }}
        >
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/45 flex-shrink-0
                           group-hover/item:bg-amber-400 group-hover/item:shadow-[0_0_6px_rgba(251,191,36,0.5)]
                           transition-all duration-250" />
          <span className="text-obsidian-300 font-body font-light text-sm leading-relaxed
                            group-hover/item:text-cream-200 transition-colors duration-250">
            {ingredient}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function RecipeDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const [recipe, setRecipe]         = useState<Recipe | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [copied, setCopied]         = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted]     = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getRecipeById(id as string)
      .then((data) => { if (!data) setNotFound(true); else setRecipe(data); })
      .finally(() => setLoading(false));
  }, [id]);

  // Animate header on mount
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !recipe) return;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [recipe]);

  const handleCopy = async () => {
    if (!recipe) return;
    const text = [
      `🍽️ ${recipe.title}`, "",
      "📋 INGREDIENTS:", ...recipe.ingredients.map((i) => `  • ${i}`), "",
      "🔀 MIXING INSTRUCTIONS:", recipe.mixingInstructions, "",
      "🔥 COOKING INSTRUCTIONS:", recipe.cookingInstructions,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleVideo = () => {
    const video = document.getElementById("recipe-video") as HTMLVideoElement;
    if (!video) return;
    if (video.paused) { video.play(); setVideoPlaying(true); }
    else              { video.pause(); setVideoPlaying(false); }
  };

  const toggleMute = () => {
    const video = document.getElementById("recipe-video") as HTMLVideoElement;
    if (!video) return;
    video.muted = !video.muted;
    setVideoMuted(video.muted);
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-mesh">
          <div className="max-w-4xl mx-auto px-4 py-24">
            <div className="space-y-6">
              <div className="h-8 skeleton rounded-xl w-1/4" />
              <div className="h-16 skeleton rounded-2xl w-3/4" />
              <div className="h-96 skeleton rounded-3xl w-full" />
              <div className="h-4 skeleton rounded-lg w-full" />
              <div className="h-4 skeleton rounded-lg w-2/3" />
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── Not found ────────────────────────────────────────────────────
  if (notFound || !recipe) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 flex items-center justify-center bg-mesh">
          <div className="text-center space-y-4 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <div className="text-6xl animate-float">🔍</div>
            <h1 className="font-display text-3xl font-light text-cream-200">Recipe not found</h1>
            <p className="text-obsidian-500 text-sm">This recipe may have been removed.</p>
            <Link href="/" className="inline-flex items-center gap-2 text-amber-400
                                      hover:text-amber-300 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to recipes
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <ReadingProgress />
      <main className="min-h-screen pt-16 bg-mesh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-obsidian-500 hover:text-amber-400
                       transition-colors mb-8 group font-body text-sm
                       opacity-0 animate-slide-right stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to recipes
          </button>

          {/* Header */}
          <div
            ref={headerRef}
            className="mb-8"
            style={{
              opacity: 0,
              transform: "translateY(28px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            <h1 className="font-display text-5xl sm:text-6xl font-light text-cream-100 leading-tight">
              {recipe.title}
            </h1>
            <div className="mt-2 h-px w-16 bg-gradient-to-r from-amber-400/40 to-transparent
                             animate-draw-line stagger-3"
                 style={{ animationFillMode: "forwards" }} />
            <p className="mt-4 text-obsidian-400 font-body font-light text-base leading-relaxed max-w-2xl">
              {recipe.shortNote}
            </p>
          </div>

          {/* Media */}
          <div className="mb-10 opacity-0 animate-scale-in stagger-2"
               style={{ animationFillMode: "forwards" }}>
            <div className="relative rounded-3xl overflow-hidden bg-obsidian-900
                            border border-white/[0.06] glow-border animate-border-glow">
              {recipe.mediaType === "video" ? (
                <div className="relative group">
                  <video
                    id="recipe-video"
                    src={recipe.mediaUrl}
                    className="w-full max-h-[480px] object-cover"
                    onEnded={() => setVideoPlaying(false)}
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <button
                        onClick={toggleVideo}
                        className="glass-amber px-4 py-2 rounded-xl flex items-center gap-2
                                   text-amber-400 text-sm font-body hover:scale-105 transition-transform"
                      >
                        {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        {videoPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="glass p-2 rounded-xl text-obsidian-400 hover:text-amber-400 transition-colors"
                      >
                        {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {!videoPlaying && (
                    <button
                      onClick={toggleVideo}
                      className="absolute inset-0 flex items-center justify-center group/play"
                    >
                      <div className="w-16 h-16 rounded-full glass-amber flex items-center justify-center
                                      group-hover/play:scale-110 transition-all duration-300 glow-amber animate-float">
                        <Play className="w-7 h-7 text-amber-400 ml-1" />
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative h-[400px] sm:h-[480px]">
                  <Image
                    src={recipe.mediaUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/30 to-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Copy button */}
          <div className="mb-10 opacity-0 animate-fade-up stagger-3"
               style={{ animationFillMode: "forwards" }}>
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4
                          rounded-2xl font-body font-medium text-sm transition-all duration-350 ${
                copied
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 scale-[0.98]"
                  : "btn-primary"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 animate-scale-in" style={{ animationFillMode: "forwards" }} />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Ingredients &amp; Instructions
                </>
              )}
            </button>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            <Section icon={<List className="w-5 h-5" />} label="Ingredients" index={4}>
              <IngredientsList ingredients={recipe.ingredients} />
            </Section>

            <Section icon={<Blend className="w-5 h-5" />} label="Mixing Instructions" index={5}>
              <div className="recipe-prose text-sm whitespace-pre-line">
                {recipe.mixingInstructions}
              </div>
            </Section>

            <Section icon={<Flame className="w-5 h-5" />} label="Cooking Instructions" index={6}>
              <div className="recipe-prose text-sm whitespace-pre-line">
                {recipe.cookingInstructions}
              </div>
            </Section>
          </div>

          <div className="h-16" />
        </div>
      </main>
    </>
  );
}
