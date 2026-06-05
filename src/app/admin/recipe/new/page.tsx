// src/app/admin/recipe/new/page.tsx
import RecipeForm from "@/components/admin/RecipeForm";

export default function NewRecipePage() {
  return (
    <div className="opacity-0 animate-fade-up">
      <RecipeForm mode="create" />
    </div>
  );
}
