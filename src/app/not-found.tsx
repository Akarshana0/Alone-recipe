// src/app/not-found.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
      <div className="text-center space-y-6 px-4">
        <div className="font-display text-[120px] font-light text-obsidian-800 leading-none select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-light text-cream-200">
          Page not found
        </h1>
        <p className="text-obsidian-500 text-sm max-w-xs mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>
      </div>
    </div>
  );
}
