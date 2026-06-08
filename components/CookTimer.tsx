'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, X, Bell } from 'lucide-react'

const PRESETS = [5, 10, 15, 20, 30, 45, 60]

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

interface CookTimerProps {
  /** Optional suggested minutes (from recipe context) */
  suggestedMinutes?: number
}

export default function CookTimer({ suggestedMinutes }: CookTimerProps) {
  const [open,      setOpen]      = useState(false)
  const [total,     setTotal]     = useState((suggestedMinutes ?? 10) * 60)
  const [remaining, setRemaining] = useState((suggestedMinutes ?? 10) * 60)
  const [running,   setRunning]   = useState(false)
  const [done,      setDone]      = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const progress    = total > 0 ? ((total - remaining) / total) * 100 : 0
  const circumference = 2 * Math.PI * 52

  const setTimer = (mins: number) => {
    setRunning(false)
    setDone(false)
    setTotal(mins * 60)
    setRemaining(mins * 60)
  }

  const start  = () => { if (remaining > 0) { setRunning(true); setDone(false) } }
  const pause  = () => setRunning(false)
  const reset  = () => { setRunning(false); setDone(false); setRemaining(total) }

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current!); return }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setDone(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running])

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:border-brand-400/40 hover:bg-brand-500/10 text-white/55 hover:text-brand-300 text-sm font-body transition-all duration-200"
      >
        <Timer className="h-4 w-4" />
        Cook Timer
        {running && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[340px] bg-[#0c0c16]/98 border border-white/[0.13] rounded-3xl p-7 shadow-glass-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-brand-500/15 border border-brand-400/20 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="font-display text-lg font-bold text-white">Cook Timer</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/30 hover:text-white/70 transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Circular dial */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    {/* Track */}
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    {/* Progress */}
                    <motion.circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="url(#timerGrad)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <Bell className="h-8 w-8 text-brand-400 animate-bounce" />
                          <span className="text-xs font-body font-semibold text-brand-300">Done!</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="time"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight"
                        >
                          {fmt(remaining)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!done && running && (
                      <span className="text-[10px] font-body text-white/25 mt-1">running</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-7 gap-1 mb-5">
                {PRESETS.map((p) => {
                  const isActive = total === p * 60
                  return (
                    <button
                      key={p}
                      onClick={() => setTimer(p)}
                      className={`py-1.5 rounded-lg text-[11px] font-body font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-500/25 border border-brand-400/50 text-brand-200'
                          : 'bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/65 hover:bg-white/[0.08]'
                      }`}
                    >
                      {p}m
                    </button>
                  )
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.09] text-sm font-body transition-all duration-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={running ? pause : start}
                  disabled={remaining === 0 && !done}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500/20 border border-brand-400/35 text-brand-200 hover:bg-brand-500/30 hover:border-brand-400/55 text-sm font-body font-semibold transition-all duration-200 disabled:opacity-40"
                >
                  {running
                    ? <><Pause className="h-4 w-4" /> Pause</>
                    : done
                    ? <><RotateCcw className="h-4 w-4" /> Restart</>
                    : <><Play  className="h-4 w-4" /> {remaining === total ? 'Start' : 'Resume'}</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
