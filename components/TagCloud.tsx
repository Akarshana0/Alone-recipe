'use client'

import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: string[]
  selected?: string
  onSelect: (tag: string) => void
}

export default function TagCloud({ tags, selected, onSelect }: TagCloudProps) {
  if (tags.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Hash className="h-3 w-3 text-white/20" />
        <span className="text-[10px] font-body text-white/20 uppercase tracking-widest">Popular Tags</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {selected && (
          <button
            onClick={() => onSelect('')}
            className="px-3 py-1 rounded-full text-xs font-body font-medium border bg-brand-500/20 border-brand-400/50 text-brand-200 transition-all duration-200"
          >
            #{selected} ×
          </button>
        )}
        {tags.map((tag, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            onClick={() => onSelect(tag === selected ? '' : tag)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-body font-medium border transition-all duration-200',
              tag === selected
                ? 'bg-brand-500/20 border-brand-400/50 text-brand-200'
                : 'bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white/65 hover:bg-white/[0.08] hover:border-white/[0.14]',
            )}
          >
            #{tag}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
