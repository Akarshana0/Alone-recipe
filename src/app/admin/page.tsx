"use client";
// src/app/admin/page.tsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  BookOpen,
  Video,
  ImageIcon,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { getAllRecipes, deleteRecipe } from "@/lib/recipeService";
import { Recipe } from "@/types/recipe";
import { Timestamp } from "firebase/firestore";

function formatDate(ts: Recipe["createdAt"]) {
  if (!ts) return "—";
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts as Date);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllRecipes();
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.shortNote?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 opacity-0 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-light text-cream-100">
            Dashboard
          </h1>
          <p className="text-obsidian-500 text-sm font-mono mt-1">
            {loading ? "..." : `${recipes.length} total recipe${recipes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/recipe/new"
          className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-body self-start"
        >
          <PlusCircle className="w-4 h-4" />
          New Recipe
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Recipes"
          value={recipes.length}
          icon={<BookOpen className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          label="With Video"
          value={recipes.filter((r) => r.mediaType === "video").length}
          icon={<Video className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          label="With Photo"
          value={recipes.filter((r) => r.mediaType === "image").length}
          icon={<ImageIcon className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-600" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full input-glass rounded-xl py-3 pl-11 pr-4 text-sm font-body"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <BookOpen className="w-10 h-10 text-obsidian-700" />
            <p className="text-obsidian-500 font-body">
              {search ? "No recipes match your search" : "No recipes yet"}
            </p>
            {!search && (
              <Link
                href="/admin/recipe/new"
                className="text-amber-400 text-sm hover:text-amber-300 transition-colors"
              >
                Create your first recipe →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-white/[0.05] text-xs font-mono text-obsidian-600 tracking-widest uppercase">
              <span>Media</span>
              <span>Recipe</span>
              <span>Type</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((recipe) => (
                <div
                  key={recipe.id}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="hidden sm:block w-12 h-12 rounded-lg overflow-hidden bg-obsidian-800 flex-shrink-0">
                    {recipe.mediaUrl && recipe.mediaType === "image" ? (
                      <Image
                        src={recipe.mediaUrl}
                        alt={recipe.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : recipe.mediaUrl && recipe.mediaType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-obsidian-800">
                        <Video className="w-5 h-5 text-obsidian-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Title + note */}
                  <div className="min-w-0">
                    <p className="font-display text-base text-cream-200 truncate">
                      {recipe.title}
                    </p>
                    <p className="text-xs text-obsidian-500 font-body truncate mt-0.5">
                      {recipe.shortNote}
                    </p>
                  </div>

                  {/* Media type badge */}
                  <div className="hidden sm:flex">
                    <span
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider ${
                        recipe.mediaType === "video"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {recipe.mediaType || "—"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block text-xs font-mono text-obsidian-600 whitespace-nowrap">
                    {formatDate(recipe.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/recipe/${recipe.id}`}
                      target="_blank"
                      className="p-2 rounded-lg glass text-obsidian-500 hover:text-amber-400 transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/recipe/${recipe.id}`}
                      className="p-2 rounded-lg glass text-obsidian-500 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    {/* Delete with confirmation */}
                    {confirmDeleteId === recipe.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          disabled={deletingId === recipe.id}
                          className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-body hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {deletingId === recipe.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg glass text-obsidian-400 text-xs font-body hover:text-cream-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(recipe.id)}
                        className="p-2 rounded-lg glass text-obsidian-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.05]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl glass-amber flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="font-display text-3xl font-light text-cream-100">{value}</p>
      <p className="text-xs text-obsidian-500 font-body mt-1">{label}</p>
    </div>
  );
}
