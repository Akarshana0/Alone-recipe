// Developer: AKARSHANA
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    // Raise chunk size warning limit — framer-motion is intentionally large
    chunkSizeWarningLimit: 600,
    // Split CSS per chunk → each page only loads its own styles
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // PERF: Fine-grained manual chunks — better long-term cache hits.
        // Each chunk is hashed independently, so a firebase update doesn't
        // bust the react chunk (and vice-versa).
        manualChunks(id) {
          // Firebase first — most specific matches
          if (id.includes("node_modules/firebase/auth") || id.includes("node_modules/@firebase/auth")) {
            return "vendor-firebase-auth";
          }
          if (id.includes("node_modules/firebase/firestore") || id.includes("node_modules/@firebase/firestore")) {
            return "vendor-firebase-firestore";
          }
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
            return "vendor-firebase-core";
          }
          // Framer Motion — large, cache aggressively
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          // Router
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
          // Everything else (including react, react-dom, react-icons, etc.)
          // goes into ONE vendor chunk — this breaks the circular dependency
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
