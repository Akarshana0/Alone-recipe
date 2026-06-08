'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Film, ImageIcon, CheckCircle2 } from 'lucide-react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import type { MediaType } from '@/types/recipe'

interface DragDropUploadProps {
  onUploadComplete: (url: string, type: MediaType) => void
  currentUrl?:      string
  currentType?:     MediaType
}

export default function DragDropUpload({
  onUploadComplete,
  currentUrl,
  currentType,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [uploading,  setUploading]  = useState(false)
  const [preview,    setPreview]    = useState<{ url: string; type: MediaType } | null>(
    currentUrl && currentType ? { url: currentUrl, type: currentType } : null,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return

      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      if (!isVideo && !isImage) return

      const mediaType: MediaType = isVideo ? 'video' : 'image'
      const localPreview = URL.createObjectURL(file)
      setPreview({ url: localPreview, type: mediaType })

      // Firebase Storage upload
      const path = `recipes/${Date.now()}_${file.name}`
      const sRef  = storageRef(storage, path)
      const task  = uploadBytesResumable(sRef, file)

      setUploading(true)
      setProgress(0)

      task.on(
        'state_changed',
        (snap) => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        },
        (err) => {
          console.error('Upload error:', err)
          setUploading(false)
        },
        async () => {
          const downloadUrl = await getDownloadURL(task.snapshot.ref)
          setUploading(false)
          setProgress(100)
          onUploadComplete(downloadUrl, mediaType)
        },
      )
    },
    [onUploadComplete],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-widest">
        Recipe Media (Image / Video)
      </label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed',
          'min-h-[160px] cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-brand-400/80 bg-brand-500/10 shadow-glow-sm'
            : 'border-white/[0.15] bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {preview ? (
          /* Preview */
          <div className="relative w-full h-40 rounded-xl overflow-hidden">
            {preview.type === 'video' ? (
              <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-sm text-white/80 font-body">Click to change</span>
            </div>
          </div>
        ) : (
          /* Default state */
          <>
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/[0.08]">
              <Upload className="h-6 w-6 text-white/50" />
            </div>
            <div className="text-center">
              <p className="text-sm font-body text-white/60">
                <span className="text-brand-400 font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-white/30 mt-1">Supports images and videos</p>
            </div>
            <div className="flex gap-3 text-xs text-white/25">
              <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> JPG, PNG, WEBP</span>
              <span className="flex items-center gap-1"><Film className="h-3 w-3" /> MP4, MOV, WEBM</span>
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-white/50">
            <span>Uploading to Firebase Storage…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!uploading && progress === 100 && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded successfully
        </p>
      )}
    </div>
  )
}
