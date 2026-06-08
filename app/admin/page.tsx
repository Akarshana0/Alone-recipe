'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, LogOut, ChefHat,
  BookOpen, Utensils, Clock,
} from 'lucide-react'
import type { Recipe } from '@/types/recipe'
import { useAuth } from '@/context/AuthContext'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [recipes,  setRecipes]  = useState<Recipe[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Live listener
  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe)))
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, 'recipes', id))
      toast.success(`"${title}" deleted.`)
    } catch {
      toast.error('Failed to delete. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const stats = [
    { label: 'Total Recipes', value: recipes.length, icon: BookOpen },
    { label: 'Categories',    value: new Set(recipes.map((r) => r.category)).size, icon: Utensils },
    { label: 'Latest',        value: recipes[0]?.title?.slice(0, 14) ?? '—', icon: Clock, text: true },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 font-body mt-0.5">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/recipe/new">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" /> New Recipe
            </Button>
          </Link>
          <Button variant="glass" size="md" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-5 flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15">
                <s.icon className="h-5 w-5 text-brand-400" />
              </span>
              <div>
                <p className="text-xs text-white/40 font-body">{s.label}</p>
                <p className={`font-display font-bold text-white ${s.text ? 'text-base truncate max-w-[160px]' : 'text-2xl'}`}>
                  {s.value}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <GlassCard className="overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[56px_1fr_140px_120px_100px] gap-4 px-5 py-3 border-b border-white/[0.08]">
          {['', 'Title', 'Category', 'Date', 'Actions'].map((h) => (
            <span key={h} className="text-[11px] font-body font-semibold text-white/30 uppercase tracking-widest">
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="h-7 w-7 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <ChefHat className="h-12 w-12 text-white/10" />
            <p className="font-display text-xl text-white/25">No recipes yet</p>
            <Link href="/admin/recipe/new">
              <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Add first recipe</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {recipes.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[56px_1fr_140px_120px_100px] gap-4 items-center px-5 py-3 hover:bg-white/[0.04] transition-colors duration-150"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  {r.mediaUrl && r.mediaType === 'image' ? (
                    <Image src={r.mediaUrl} alt={r.title} width={40} height={40} className="object-cover h-10 w-10" />
                  ) : (
                    <ChefHat className="h-4 w-4 text-white/20" />
                  )}
                </div>

                {/* Title + note */}
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm text-white truncate">{r.title}</p>
                  <p className="text-xs text-white/35 truncate mt-0.5">{r.shortNote}</p>
                </div>

                {/* Category */}
                <span className="text-xs font-body text-brand-300/80 bg-brand-500/10 border border-brand-400/20 px-2.5 py-0.5 rounded-full w-fit truncate">
                  {r.category}
                </span>

                {/* Date */}
                <span className="text-xs font-body text-white/30">
                  {r.createdAt
                    ? new Date(
                        typeof (r.createdAt as any).toDate === 'function'
                          ? (r.createdAt as any).toDate()
                          : r.createdAt,
                      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                    : '—'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/recipe/${r.id}`}>
                    <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id, r.title)}
                    disabled={deleting === r.id}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    {deleting === r.id
                      ? <span className="h-3.5 w-3.5 border border-red-400 border-t-transparent rounded-full animate-spin block" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
