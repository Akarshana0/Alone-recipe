'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Shared glass base ────────────────────────────────────────────
const glassBase = [
  'w-full rounded-xl border border-white/[0.13] bg-white/[0.06] backdrop-blur-sm',
  'text-white placeholder:text-white/30 font-body text-sm',
  'px-4 py-3 outline-none',
  'transition-all duration-200',
  'focus:border-brand-400/60 focus:bg-white/[0.10] focus:ring-2 focus:ring-brand-400/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
]

// ─── Input ───────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-white/60 uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(glassBase, error && 'border-red-400/50 focus:ring-red-400/20', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'

// ─── Textarea ────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-white/60 uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          glassBase,
          'resize-none min-h-[120px] leading-relaxed',
          error && 'border-red-400/50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  ),
)
Textarea.displayName = 'Textarea'
