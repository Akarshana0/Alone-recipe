'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'alone-recipes-saved'

export function useSaved() {
  const [saved,    setSaved]    = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setSaved(new Set(JSON.parse(raw) as string[]))
    } catch {}
    setHydrated(true)
  }, [])

  const toggle = useCallback((id: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setSaved(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      try { localStorage.setItem(KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const isSaved   = (id: string) => saved.has(id)
  const savedIds  = saved

  return { isSaved, toggle, hydrated, count: saved.size, savedIds }
}
