"use client";
// src/components/admin/AdminSidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/recipe/new", icon: PlusCircle, label: "New Recipe" },
];

export default function AdminSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl glass-amber flex items-center justify-center group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-display text-base font-light text-cream-100 tracking-wider">
              ALONE recipes
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-2.5 h-2.5 text-amber-400/60" />
              <p className="text-[10px] font-mono text-obsidian-600 tracking-widest uppercase">
                Admin
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                isActive
                  ? "glass-amber text-amber-400 border border-amber-400/20"
                  : "text-obsidian-400 hover:text-cream-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 p-3 rounded-xl glass mb-3">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Admin"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-cream-200 font-body truncate">
              {user?.displayName || "Admin"}
            </p>
            <p className="text-[10px] text-obsidian-600 font-mono truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-obsidian-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-body transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass border-r border-white/[0.06] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          <span className="font-display text-sm text-cream-100 tracking-wider">
            ALONE Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass p-2 rounded-xl text-obsidian-400"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-obsidian-950/80" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col glass border-r border-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top padding spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
