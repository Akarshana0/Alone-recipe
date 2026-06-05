"use client";
// src/app/admin/recipe/[id]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import RecipeForm from "@/components/admin/RecipeForm";
import { getRecipeById } from "@/lib/recipeService";
import { Recipe } from "@/types/recipe";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecipeById(id as string)
      .then((data) => {
        if (!data) setNotFound(true);
        else setRecipe(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="text-center py-32">
        <p className="font-display text-2xl text-obsidian-500">
          Recipe not found
        </p>
      </div>
    );
  }

  return (
    <div className="opacity-0 animate-fade-up">
      <RecipeForm mode="edit" initialData={recipe} />
    </div>
  );
}
