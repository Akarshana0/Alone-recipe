# ALONE recipes — v4

A professional-grade Next.js recipe platform with Firebase backend.

## What's New in v4

### 🆕 New Features
- **Meal Planner** (`/meal-plan`) — Weekly 7-day × 3-meal planner with drag-select, auto-fill randomizer, and shopping list export
- **Shopping List** — Auto-generated from meal plan, copyable to clipboard
- **Cooking Mode** — Full-screen step-by-step guided cooking with keyboard navigation (← →), ingredient checklist, and built-in timer
- **Tag Cloud** — Browse recipes by tag on the homepage
- **Mobile Bottom Nav** — Persistent bottom navigation bar for mobile devices (sm breakpoint and below)
- **Avg Cook Time stat** — Added to hero stats strip

### 🔧 Improvements
- Navbar updated with Meal Planner link + Calendar icon
- Footer updated with Meal Planner link
- Mobile bottom padding adjusted for bottom nav bar
- Recipe detail: "Cooking Mode" button in action bar
- Tag filter integrated with existing category/difficulty/search filters
- "Clear filters" resets tags too

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Firebase credentials
npm run dev
```

## Stack
- Next.js 14 (App Router)
- Firebase (Firestore, Auth)
- Framer Motion
- Tailwind CSS
- Lucide React
- Sonner (toasts)
