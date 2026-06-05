"use client";
// src/app/admin/layout.tsx
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    // Not on login page and not admin → redirect to login
    if (!isLoginPage && !isAdmin) {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, isLoginPage, router]);

  // While checking auth, show a full-page loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-obsidian-500 font-mono text-xs tracking-widest uppercase">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-obsidian-950">{children}</div>;
  }

  // If somehow not admin and not loading (shouldn't normally reach here)
  if (!isAdmin) return null;

  // Admin layout with sidebar
  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
