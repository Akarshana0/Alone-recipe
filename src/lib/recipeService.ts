// src/lib/recipeService.ts
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Recipe, RecipeFormData } from "@/types/recipe";

const COLLECTION = "recipes";

// ─── Fetch all recipes ──────────────────────────────────────────────────────
export async function getAllRecipes(): Promise<Recipe[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe));
}

// ─── Search recipes by title ────────────────────────────────────────────────
export async function searchRecipes(searchTerm: string): Promise<Recipe[]> {
  // Firestore doesn't support full-text search natively.
  // We fetch all and filter client-side for simplicity.
  // For production scale, consider Algolia or a Cloud Function.
  const all = await getAllRecipes();
  const term = searchTerm.toLowerCase();
  return all.filter(
    (r) =>
      r.title.toLowerCase().includes(term) ||
      r.shortNote.toLowerCase().includes(term)
  );
}

// ─── Fetch a single recipe ──────────────────────────────────────────────────
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Recipe;
}

// ─── Create a new recipe ────────────────────────────────────────────────────
export async function createRecipe(data: RecipeFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Update an existing recipe ──────────────────────────────────────────────
export async function updateRecipe(
  id: string,
  data: Partial<RecipeFormData>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data });
}

// ─── Delete a recipe ─────────────────────────────────────────────────────────
export async function deleteRecipe(id: string): Promise<void> {
  // First get recipe to delete its media from Storage too
  const recipe = await getRecipeById(id);
  if (recipe?.mediaUrl) {
    try {
      const mediaRef = ref(storage, recipe.mediaUrl);
      await deleteObject(mediaRef);
    } catch {
      // File might already be deleted; continue
    }
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

// ─── Upload media file to Firebase Storage ──────────────────────────────────
export function uploadMedia(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ url: string; type: "image" | "video" }> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop();
    const fileName = `recipes/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        const type = file.type.startsWith("video") ? "video" : "image";
        resolve({ url, type });
      }
    );
  });
}
