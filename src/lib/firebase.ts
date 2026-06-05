// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent re-initialization in Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// getAuth() validates the API key at init time, which throws during Next.js
// static page generation when env vars are not yet present at build time.
// A lazy Proxy defers the actual getAuth() call until first property access,
// which only happens client-side (inside useEffect / event handlers).
let _auth: Auth | undefined;
export const auth = new Proxy({} as Auth, {
  get(_, prop: string | symbol) {
    if (!_auth) _auth = getAuth(app);
    return Reflect.get(_auth, prop);
  },
  set(_, prop: string | symbol, value: unknown) {
    if (!_auth) _auth = getAuth(app);
    return Reflect.set(_auth, prop, value);
  },
  has(_, prop: string | symbol) {
    if (!_auth) _auth = getAuth(app);
    return prop in _auth;
  },
});

export default app;
