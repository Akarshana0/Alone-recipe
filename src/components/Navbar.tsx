"use client";
// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Scroll progress line */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
      />

      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-obsidian-950/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-400 ${
              scrolled ? "h-14" : "h-16"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className={`rounded-lg glass-amber flex items-center justify-center
                  group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]
                  ${scrolled ? "w-7 h-7" : "w-8 h-8"}`}
              >
                <UtensilsCrossed
                  className={`text-amber-400 transition-all duration-300 ${
                    scrolled ? "w-3.5 h-3.5" : "w-4 h-4"
                  }`}
                />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center opacity-0 animate-slide-right stagger-1"
                     style={{ animationFillMode: "forwards" }}>
                  <span
                    className={`font-display font-light tracking-[0.15em] text-cream-100 transition-all duration-400 ${
                      scrolled ? "text-lg" : "text-xl"
                    }`}
                  >
                    ALONE
                  </span>
                  <span
                    className={`font-display font-light tracking-[0.15em] text-amber-400 ml-2 transition-all duration-400 ${
                      scrolled ? "text-lg" : "text-xl"
                    }`}
                  >
                    recipes
                  </span>
                </div>
              </div>
            </Link>

            {/* Tagline */}
            <div className="hidden md:flex items-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/20
                              opacity-0 animate-fade-in stagger-3"
                   style={{ animationFillMode: "forwards" }}
              />
              <p className="font-body text-xs tracking-[0.22em] uppercase text-obsidian-400
                             opacity-0 animate-fade-in stagger-4"
                 style={{ animationFillMode: "forwards" }}>
                Handcrafted with care
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
