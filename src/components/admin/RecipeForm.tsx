"use client";
// src/components/admin/RecipeForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChefHat,
  List,
  Blend,
  Flame,
  FileText,
  CheckCircle2,
} from "lucide-react";
import MediaUpload from "./MediaUpload";
import { createRecipe, updateRecipe } from "@/lib/recipeService";
import { Recipe, RecipeFormData } from "@/types/recipe";

interface RecipeFormProps {
  initialData?: Recipe;
  mode: "create" | "edit";
}

const EMPTY_FORM: RecipeFormData = {
  title: "",
  shortNote: "",
  mediaUrl: "",
  mediaType: "image",
  ingredients: [""],
  mixingInstructions: "",
  cookingInstructions: "",
};

export default function RecipeForm({ initialData, mode }: RecipeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<RecipeFormData>(
    initialData
      ? {
          title: initialData.title,
          shortNote: initialData.shortNote,
          mediaUrl: initialData.mediaUrl,
          mediaType: initialData.mediaType,
          ingredients: initialData.ingredients?.length
            ? initialData.ingredients
            : [""],
          mixingInstructions: initialData.mixingInstructions,
          cookingInstructions: initialData.cookingInstructions,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers ───────────────────────────────────────────────────
  const updateField = <K extends keyof RecipeFormData>(
    key: K,
    value: RecipeFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateIngredient = (index: number, value: string) => {
    const updated = [...form.ingredients];
    updated[index] = value;
    setForm((prev) => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () =>
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));

  const removeIngredient = (index: number) =>
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));

  const handleMediaUpload = (url: string, type: "image" | "video") => {
    setForm((prev) => ({ ...prev, mediaUrl: url, mediaType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.title.trim()) {
      setError("Recipe title is required.");
      return;
    }
    const cleanedIngredients = form.ingredients.filter((i) => i.trim());
    if (cleanedIngredients.length === 0) {
      setError("At least one ingredient is required.");
      return;
    }

    const payload: RecipeFormData = {
      ...form,
      ingredients: cleanedIngredients,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const newId = await createRecipe(payload);
        setSaved(true);
        setTimeout(() => router.push(`/admin`), 1200);
      } else if (initialData?.id) {
        await updateRecipe(initialData.id, payload);
        setSaved(true);
        setTimeout(() => router.push(`/admin`), 1200);
      }
    } catch (err) {
      setError("Failed to save recipe. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light text-cream-100">
            {mode === "create" ? "New Recipe" : "Edit Recipe"}
          </h1>
          <p className="text-obsidian-500 text-sm font-body mt-1">
            {mode === "create"
              ? "Fill in the details below"
              : `Editing: ${initialData?.title}`}
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-body">
            <CheckCircle2 className="w-5 h-5" />
            Saved!
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
          {error}
        </div>
      )}

      {/* ── Basic Info ──────────────────────────────────────────── */}
      <FormSection icon={<ChefHat className="w-4 h-4" />} label="Basic Info">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Saffron Chicken Biryani"
              className="w-full input-glass rounded-xl px-4 py-3 text-sm font-body"
              required
            />
          </div>
          {/* Short note */}
          <div>
            <label className="block text-xs font-mono text-obsidian-500 uppercase tracking-widest mb-2">
              Short Note / Description
            </label>
            <textarea
              value={form.shortNote}
              onChange={(e) => updateField("shortNote", e.target.value)}
              placeholder="A brief, enticing description of the recipe..."
              rows={2}
              className="w-full input-glass rounded-xl px-4 py-3 text-sm font-body resize-none"
            />
          </div>
        </div>
      </FormSection>

      {/* ── Media Upload ────────────────────────────────────────── */}
      <FormSection icon={<FileText className="w-4 h-4" />} label="Media">
        <MediaUpload
          currentUrl={form.mediaUrl}
          currentType={form.mediaType}
          onUploadComplete={handleMediaUpload}
        />
      </FormSection>

      {/* ── Ingredients ─────────────────────────────────────────── */}
      <FormSection icon={<List className="w-4 h-4" />} label="Ingredients">
        <div className="space-y-2">
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full glass-amber flex items-center justify-center">
                <span className="text-amber-400 text-[10px] font-mono">
                  {index + 1}
                </span>
              </div>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className="flex-1 input-glass rounded-xl px-4 py-2.5 text-sm font-body"
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 rounded-lg glass text-obsidian-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-obsidian-500 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-200 text-sm font-body"
          >
            <Plus className="w-4 h-4" />
            Add ingredient
          </button>
        </div>
      </FormSection>

      {/* ── Mixing Instructions ─────────────────────────────────── */}
      <FormSection
        icon={<Blend className="w-4 h-4" />}
        label="Mixing Instructions"
      >
        <textarea
          value={form.mixingInstructions}
          onChange={(e) => updateField("mixingInstructions", e.target.value)}
          placeholder="Describe how to mix and prepare the ingredients..."
          rows={5}
          className="w-full input-glass rounded-xl px-4 py-3 text-sm font-body resize-y leading-relaxed"
        />
      </FormSection>

      {/* ── Cooking Instructions ─────────────────────────────────── */}
      <FormSection
        icon={<Flame className="w-4 h-4" />}
        label="Cooking Instructions"
      >
        <textarea
          value={form.cookingInstructions}
          onChange={(e) => updateField("cookingInstructions", e.target.value)}
          placeholder="Step-by-step cooking and preparation guide..."
          rows={7}
          className="w-full input-glass rounded-xl px-4 py-3 text-sm font-body resize-y leading-relaxed"
        />
      </FormSection>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-body disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-6 py-3.5 rounded-xl glass text-obsidian-400 hover:text-cream-200 text-sm font-body transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Helper ─────────────────────────────────────────────────────────
function FormSection({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/[0.05]">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg glass-amber flex items-center justify-center text-amber-400">
          {icon}
        </div>
        <h3 className="font-display text-lg font-light text-cream-200">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}
