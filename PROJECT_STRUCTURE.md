# Samura Exider — Project Structure & Setup Guide

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS (Neon/Glassmorphism)
- **Animations**: Framer Motion
- **Backend/Auth/DB**: Firebase (Auth, Firestore, Storage)
- **Email**: EmailJS
- **Routing**: React Router DOM v6

---

## 📁 Folder Structure

```
samura-exider/
├── public/
│   └── favicon.png
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── CyberButton.jsx
│   │   ├── GlassCard.jsx
│   │   ├── NeonDivider.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── PublicDownloadsPage.jsx
│   │   ├── AuthPage.jsx
│   │   └── portal/
│   │       ├── DashboardPage.jsx
│   │       ├── ModeStorePage.jsx
│   │       └── SecureDownloadsPage.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js
│   │   └── firestore.js
│   ├── hooks/
│   │   └── useUserData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## ⚡ Step 1: Create Vite Project

```bash
npm create vite@latest samura-exider -- --template react
cd samura-exider
npm install
```

## ⚡ Step 2: Install Dependencies

```bash
npm install firebase react-router-dom framer-motion @emailjs/browser react-icons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## ⚡ Step 3: Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → "samura-exider"
3. Enable: **Authentication** (Email/Password + Google)
4. Enable: **Firestore Database** (production mode)
5. Copy your config to `.env`

## ⚡ Step 4: .env File

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_EMAILJS_SERVICE_ID=your_emailjs_service
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

VITE_WHATSAPP_NUMBER=94XXXXXXXXX
VITE_BANK_NAME=Commercial Bank
VITE_BANK_ACCOUNT=1234567890
VITE_BANK_HOLDER=Your Name
VITE_EZCASH_NUMBER=07XXXXXXXX
```

## ⚡ Step 5: Deploy Firestore Rules & Indexes

The `downloads` collection queries require a **composite index** on `(isPremium ASC, updatedAt DESC)`.
Without this, the downloads pages will fail to load data.

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login and link project
firebase login
firebase use --add   # select your project

# Deploy rules + index in one command
firebase deploy --only firestore
```

Or create the index manually in Firebase Console:
**Firestore → Indexes → Composite → Add index**
- Collection: `downloads`
- Fields: `isPremium` (Ascending) + `updatedAt` (Descending)

## ⚡ Step 6: Firestore Database Structure

```
/users/{uid}
  - displayName: string
  - email: string
  - photoURL: string
  - plan: "free" | "weekly" | "monthly" | "yearly"
  - licenseExpiry: timestamp
  - activeDevices: number
  - maxDevices: number
  - createdAt: timestamp

/downloads/{docId}
  - name: string
  - version: string
  - description: string
  - url: string
  - isPremium: boolean
  - category: string
  - updatedAt: timestamp

/packages/{docId}
  - name: string
  - duration: string
  - price: number
  - features: string[]
  - isPopular: boolean
```
