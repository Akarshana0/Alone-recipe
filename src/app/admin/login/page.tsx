"use client";
// src/app/admin/login/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Chrome, AlertTriangle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const { isAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already admin
  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, loading, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    const result = await signInWithGoogle();
    setSigningIn(false);
    if (result.success) {
      router.replace("/admin");
    } else {
      setError(result.error || "Sign in failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-400/[0.03] blur-[100px]" />
      </div>

      <div className="w-full max-w-md opacity-0 animate-fade-up">
        {/* Card */}
        <div className="glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] glow-border">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl glass-amber flex items-center justify-center glow-amber">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-obsidian-900 border border-amber-400/30 flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-light text-cream-100 mb-2">
              Admin Access
            </h1>
            <p className="text-obsidian-500 text-sm font-body font-light leading-relaxed">
              Restricted to authorized personnel only.
              <br />
              Sign in with your approved Google account.
            </p>
          </div>

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <span className="font-display text-lg font-light text-cream-200">
                ALONE
              </span>
              <span className="text-obsidian-600">·</span>
              <span className="font-mono text-xs text-obsidian-500 tracking-widest uppercase">
                recipes
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-body font-medium">
                  Access Denied
                </p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl glass border border-white/10 hover:border-white/20 text-cream-100 font-body font-medium text-sm transition-all duration-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            ) : (
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Disclaimer */}
          <p className="mt-6 text-center text-obsidian-700 text-xs font-body">
            Unauthorized access attempts are blocked and logged.
          </p>
        </div>
      </div>
    </div>
  );
}
