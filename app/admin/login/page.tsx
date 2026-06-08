'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import GlassCard from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const { signIn } = useAuth()

  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="p-8 space-y-7">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
              <Flame className="h-7 w-7 text-white" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                Admin Panel
              </h1>
              <p className="text-sm text-white/40 font-body mt-1">
                Sign in to manage your recipes
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08]" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="chef@alone.recipes"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Mail className="absolute right-4 bottom-3.5 h-4 w-4 text-white/20 pointer-events-none" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-4 bottom-3.5 text-white/25 hover:text-white/60 transition-colors"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2"
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}
