# 🍽️ ALONE Recipes

A modern, glassmorphism-styled recipe management web app built with Next.js 14, Tailwind CSS, and Firebase.

---

## ✨ Features

- **Public front-end** — fully open, no login required for visitors
- **Search** — instant client-side search by name and note
- **Recipe detail pages** — with media player, ingredients, instructions, and a **copy-to-clipboard** button
- **Admin panel** — Google login restricted to a single authorized email
- **Full CRUD** — create, edit, delete recipes with media uploads
- **Progress bar uploads** — real-time upload progress for photos and videos
- **Glassmorphism UI** — dark, editorial aesthetic with amber accents

---

## 🗂️ Folder Structure

```
alone-recipes/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with AuthProvider
│   │   ├── globals.css             # Design system & Tailwind utilities
│   │   ├── page.tsx                # Home page (search + recipe grid)
│   │   ├── not-found.tsx           # 404 page
│   │   ├── recipe/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Recipe detail page (public)
│   │   └── admin/
│   │       ├── layout.tsx          # Admin layout with auth guard
│   │       ├── page.tsx            # Admin dashboard (recipe list)
│   │       ├── login/
│   │       │   └── page.tsx        # Admin Google login page
│   │       └── recipe/
│   │           ├── new/
│   │           │   └── page.tsx    # Create new recipe
│   │           └── [id]/
│   │               └── page.tsx    # Edit existing recipe
│   ├── components/
│   │   ├── Navbar.tsx              # Public site navigation
│   │   ├── RecipeCard.tsx          # Recipe card for grid
│   │   ├── SkeletonCard.tsx        # Loading skeleton
│   │   └── admin/
│   │       ├── AdminSidebar.tsx    # Admin nav sidebar
│   │       ├── MediaUpload.tsx     # Drag & drop upload with progress
│   │       └── RecipeForm.tsx      # Shared create/edit form
│   ├── context/
│   │   └── AuthContext.tsx         # Firebase Auth + admin email guard
│   ├── lib/
│   │   ├── firebase.ts             # Firebase app initialization
│   │   └── recipeService.ts        # Firestore & Storage service functions
│   └── types/
│       └── recipe.ts               # TypeScript types
├── firestore.rules                 # Firestore security rules
├── storage.rules                   # Firebase Storage security rules
├── firestore.indexes.json          # Firestore indexes
├── firebase.json                   # Firebase project config
├── .env.local.example              # Environment variable template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it (e.g. `alone-recipes`)
3. Disable Google Analytics (optional) → Create project

### 2. Set Up Firebase Services

**Firestore Database:**
- Firebase Console → Build → Firestore Database → Create database
- Start in **production mode**
- Choose your region

**Firebase Storage:**
- Firebase Console → Build → Storage → Get started
- Start in **production mode**

**Firebase Authentication:**
- Firebase Console → Build → Authentication → Get started
- Enable **Google** sign-in provider
- Add your domain to Authorized domains (add `localhost` for dev)

### 3. Get Your Firebase Config

Firebase Console → Project Settings (⚙️) → General → Your apps → Web app (</>) → Register app

Copy the `firebaseConfig` object values.

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Fill in your Firebase values
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_ADMIN_EMAIL=pansiluakarshana0@gmail.com
```

### 5. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project)
firebase use --add

# Deploy rules
firebase deploy --only firestore:rules,storage
```

### 6. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Security Model

| Route | Access |
|-------|--------|
| `/` | Public — anyone |
| `/recipe/[id]` | Public — anyone |
| `/admin/login` | Public page (only shows login form) |
| `/admin` | **Only** `pansiluakarshana0@gmail.com` |
| `/admin/recipe/new` | **Only** `pansiluakarshana0@gmail.com` |
| `/admin/recipe/[id]` | **Only** `pansiluakarshana0@gmail.com` |

- Any Google account other than the admin email is immediately signed out and shown "Access Denied"
- Firestore rules enforce the same restriction at the database level
- Storage rules enforce the same restriction at the file level

---

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom glassmorphism utilities
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication (Google)
- **Fonts**: Cormorant Garamond (display) + DM Sans (body) + DM Mono

---

## 📦 Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all `NEXT_PUBLIC_*` environment variables in Vercel dashboard
4. Add your Vercel domain to Firebase Auth → Authorized domains
5. Deploy

---

## 🗄️ Firestore Schema

Collection: `recipes`

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Recipe name |
| `shortNote` | string | Brief description shown on card |
| `mediaUrl` | string | Firebase Storage download URL |
| `mediaType` | string | `"image"` or `"video"` |
| `ingredients` | string[] | List of ingredients |
| `mixingInstructions` | string | How to mix/prepare |
| `cookingInstructions` | string | Cooking steps |
| `createdAt` | timestamp | Server timestamp |
