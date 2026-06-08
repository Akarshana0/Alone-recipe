'use client'

import { useEffect, useRef } from 'react'

// Floating food particles
const PARTICLES = ['🍳','🌿','✦','🫙','🥄','◆','🍋','✧','🌶️','◇','🧄','✦']

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Scroll progress bar
    const progressBar = document.getElementById('scroll-progress')
    const onScroll = () => {
      if (!progressBar) return
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct   = total > 0 ? (window.scrollY / total) * 100 : 0
      progressBar.style.width = `${pct}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Spawn particles
    const particles: HTMLElement[] = []
    const spawn = () => {
      const p   = document.createElement('div')
      const sym = PARTICLES[Math.floor(Math.random() * PARTICLES.length)]
      const x   = Math.random() * 100
      const dur = 18 + Math.random() * 22
      const del = Math.random() * 8
      const sz  = 10 + Math.random() * 14

      p.textContent = sym
      p.style.cssText = `
        position:absolute; left:${x}%; bottom:-5%;
        font-size:${sz}px; opacity:0;
        pointer-events:none; user-select:none;
        filter:blur(0.4px) opacity(0.35);
        animation: particleFloat ${dur}s ${del}s linear infinite;
      `
      el.appendChild(p)
      particles.push(p)
    }

    // Spawn 14 particles
    for (let i = 0; i < 14; i++) spawn()

    return () => {
      window.removeEventListener('scroll', onScroll)
      particles.forEach((p) => p.remove())
    }
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <div id="scroll-progress" />

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Main background */}
      <div className="fixed inset-0 -z-10 overflow-hidden" ref={containerRef}>

        {/* Deep base */}
        <div className="absolute inset-0 bg-[#080810]" />

        {/* Primary warm orb — top-left */}
        <div
          className="absolute -top-[35%] -left-[20%] w-[90vw] h-[90vw] rounded-full
            bg-gradient-radial from-brand-600/50 via-brand-800/15 to-transparent
            blur-[120px] animate-drift opacity-35"
        />

        {/* Secondary warm orb — top-right */}
        <div
          className="absolute -top-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full
            bg-gradient-radial from-orange-400/20 via-brand-700/10 to-transparent
            blur-[80px] animate-drift-slow opacity-25"
          style={{ animationDelay: '5s' }}
        />

        {/* Cool deep orb — bottom-right */}
        <div
          className="absolute -bottom-[25%] -right-[15%] w-[70vw] h-[70vw] rounded-full
            bg-gradient-radial from-teal-600/25 via-cyan-800/10 to-transparent
            blur-[100px] animate-drift opacity-20"
          style={{ animationDelay: '8s' }}
        />

        {/* Centre accent orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[45vw] h-[45vw] rounded-full
            bg-gradient-radial from-brand-500/12 to-transparent
            blur-[80px] animate-pulse-slower opacity-40"
        />

        {/* Bottom warmth strip */}
        <div
          className="absolute bottom-0 inset-x-0 h-[30vh]
            bg-gradient-to-t from-brand-900/20 to-transparent"
        />

        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Diagonal accent lines */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(249,115,22,0.8) 0px, rgba(249,115,22,0.8) 1px, transparent 1px, transparent 80px)',
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />

      </div>
    </>
  )
}
