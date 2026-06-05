// src/types/recipe.ts
import { Timestamp } from "firebase/firestore";

export interface Recipe {
  id: string;
  title: string;
  shortNote: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  ingredients: string[];
  mixingInstructions: string;
  cookingInstructions: string;
  createdAt: Timestamp | Date;
}

export type RecipeFormData = Omit<Recipe, "id" | "createdAt">;
