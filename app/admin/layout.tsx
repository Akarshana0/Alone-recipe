'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const ADMIN_EMAIL = 'pansiluakarshana0@gmail.com'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/admin/login')
      return
    }
    if (user.email !== ADMIN_EMAIL) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-brand-400/30 border-t-brand-400 animate-spin" />
      </div>
    )
  }

  if (!user || user.email !== ADMIN_EMAIL) return null

  return <>{children}</>
}
