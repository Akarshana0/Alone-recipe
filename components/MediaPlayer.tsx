'use client'

import Image from 'next/image'
import { ChefHat } from 'lucide-react'
import type { MediaType } from '@/types/recipe'

interface MediaPlayerProps {
  url:  string
  type: MediaType
  alt:  string
}

export default function MediaPlayer({ url, type, alt }: MediaPlayerProps) {
  if (!url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10">
        <ChefHat className="h-24 w-24 text-white/10" />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-glass-lg border border-white/10">
        <video
          src={url}
          controls
          className="w-full aspect-video object-cover bg-black"
          poster=""
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-glass-lg border border-white/10">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 896px"
        priority
      />
    </div>
  )
}
