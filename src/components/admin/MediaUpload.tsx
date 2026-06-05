"use client";
// src/components/admin/MediaUpload.tsx
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Film,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { uploadMedia } from "@/lib/recipeService";

interface MediaUploadProps {
  currentUrl?: string;
  currentType?: "image" | "video";
  onUploadComplete: (url: string, type: "image" | "video") => void;
}

export default function MediaUpload({
  currentUrl,
  currentType,
  onUploadComplete,
}: MediaUploadProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError("Only image and video files are supported.");
        return;
      }
      // Validate size (max 100MB for video, 10MB for image)
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(
          `File too large. Max ${isVideo ? "100MB for video" : "10MB for image"}.`
        );
        return;
      }

      setError(null);
      setDone(false);
      setUploading(true);
      setProgress(0);

      try {
        const { url, type } = await uploadMedia(file, (p) => setProgress(p));
        onUploadComplete(url, type);
        setDone(true);
      } catch (err) {
        setError("Upload failed. Please try again.");
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragOver
            ? "border-amber-400/60 bg-amber-400/5"
            : uploading
            ? "border-amber-400/30 bg-amber-400/[0.02] cursor-not-allowed"
            : "border-white/10 hover:border-amber-400/30 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {uploading ? (
            <>
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-2xl glass-amber flex items-center justify-center">
                  <Upload className="w-6 h-6 text-amber-400 animate-bounce" />
                </div>
                {/* Circular progress */}
                <svg
                  className="absolute -inset-1 w-16 h-16 -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(251,191,36,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(251,191,36,0.7)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <p className="text-amber-400 font-body text-sm font-medium">
                Uploading... {progress}%
              </p>
              <div className="mt-3 w-48 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : done ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-emerald-400 font-body text-sm font-medium">
                Upload complete!
              </p>
              <p className="text-obsidian-600 text-xs mt-1">
                Click to replace
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center mb-4">
                <Upload className="w-5 h-5 text-obsidian-500" />
              </div>
              <p className="text-cream-200 font-body text-sm font-medium">
                Drop a file here, or{" "}
                <span className="text-amber-400">click to browse</span>
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-obsidian-600 text-xs">
                  <ImageIcon className="w-3 h-3" />
                  <span>Images up to 10MB</span>
                </div>
                <span className="text-obsidian-700">·</span>
                <div className="flex items-center gap-1.5 text-obsidian-600 text-xs">
                  <Film className="w-3 h-3" />
                  <span>Videos up to 100MB</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm px-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Current media preview */}
      {currentUrl && (
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-obsidian-900">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05]">
            {currentType === "video" ? (
              <Film className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-xs text-obsidian-500 font-mono">
              Current media
            </span>
          </div>
          {currentType === "video" ? (
            <video
              src={currentUrl}
              className="w-full max-h-48 object-cover"
              controls
              playsInline
            />
          ) : (
            <div className="relative h-48">
              <Image
                src={currentUrl}
                alt="Current media"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
