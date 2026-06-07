# Samura Xiter — Cloudflare Pages Deployment Guide

## IMPORTANT: Security Before Pushing

Your `.env` file contains real credentials.
`.gitignore` already excludes it — **NEVER delete `.gitignore`**.

```bash
git status   # .env must NOT appear in the list
```

---

## Step 1: Firebase Project Setup

1. Go to https://console.firebase.google.com → New Project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in production mode
4. Go to Project Settings → copy config values into your `.env`

### Create Admin account:
After signing up in the app, go to Firestore → `users` collection →
find your user doc → add field: `role: "admin"` (string).
This unlocks `/admin`.

---

## Step 2: Deploy Firestore Security Rules

Firebase Console → Firestore → Rules tab →
paste contents of `firestore.rules` → click **Publish**.

---

## Step 3: Create Firestore Indexes

Firebase Console → Firestore → Indexes → Add composite indexes:

| Collection      | Field 1                | Field 2                | Field 3                |
|-----------------|------------------------|------------------------|------------------------|
| `downloads`     | `isPremium` ASC        | `updatedAt` DESC       |                        |
| `downloads`     | `isPremium` ASC        | `isActive` ASC         | `updatedAt` DESC       |
| `orders`        | `uid` ASC              | `createdAt` DESC       |                        |
| `orders`        | `status` ASC           | `createdAt` DESC       |                        |
| `announcements` | `isActive` ASC         | `createdAt` DESC       |                        |
| `tickets`       | `uid` ASC              | `updatedAt` DESC       |                        |
| `tickets`       | `status` ASC           | `updatedAt` DESC       |                        |

*(Or deploy via Firebase CLI: `firebase deploy --only firestore:indexes`)*

---

## Step 4: Authorize Your Cloudflare Domain in Firebase

**This causes the `auth/unauthorized-domain` error if skipped.**

Firebase Console → Authentication → Settings → **Authorized domains**:
- Add `your-project.pages.dev`
- Add your custom domain (e.g. `samuraxiter.site`) if you have one

Do this BEFORE your first login attempt on the live site.

---

## Step 5: Push to GitHub

```bash
git init
git add .
git commit -m "feat: Samura Xiter launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 6: Deploy on Cloudflare Pages

1. Go to https://dash.cloudflare.com → Workers & Pages → Create
2. Click **Pages** → Connect to Git → select your GitHub repo
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Settings → Environment Variables** → Add ALL values from `.env`:

| Variable                            | Where to find it                     |
|-------------------------------------|--------------------------------------|
| `VITE_FIREBASE_API_KEY`             | Firebase → Project Settings → Apps   |
| `VITE_FIREBASE_AUTH_DOMAIN`         | same                                  |
| `VITE_FIREBASE_PROJECT_ID`          | same                                  |
| `VITE_FIREBASE_STORAGE_BUCKET`      | same                                  |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same                                  |
| `VITE_FIREBASE_APP_ID`              | same                                  |
| `VITE_FIREBASE_MEASUREMENT_ID`      | same (optional, for Analytics)        |
| `VITE_EMAILJS_SERVICE_ID`           | emailjs.com dashboard                 |
| `VITE_EMAILJS_TEMPLATE_ID`          | emailjs.com dashboard                 |
| `VITE_EMAILJS_PUBLIC_KEY`           | emailjs.com dashboard                 |
| `VITE_WHATSAPP_NUMBER`              | e.g. `94763XXXXXX`                    |
| `VITE_BANK_NAME`                    | Your bank name                        |
| `VITE_BANK_ACCOUNT`                 | Your account number                   |
| `VITE_BANK_HOLDER`                  | Account holder name                   |
| `VITE_EZCASH_NUMBER`                | Your EzCash number                    |

5. Click **Save and Deploy**

---

## Step 7: Custom Domain (Optional)

Cloudflare Pages → your project → Custom Domains → Add domain.
Then Firebase → Authentication → Authorized domains → add your domain.

---

## Cloudflare Pages SPA Routing

The `public/_redirects` file handles client-side routing:
```
/* /index.html 200
```
This ensures page refreshes and direct URL access work correctly.

The `public/_headers` file sets security headers and aggressive caching
for hashed asset files.

---

## Local Development

```bash
cp .env.example .env   # fill in your real values
npm install
npm run dev            # runs at http://localhost:5173
```

---

## Admin Panel

URL: `https://your-site.pages.dev/admin`

| Tab              | What you can do                                     |
|------------------|-----------------------------------------------------|
| **Overview**     | Live stats: users, orders, downloads, premium count |
| **Orders**       | View/confirm/reject orders                          |
| **Packages**     | Add / edit / delete pricing packages                |
| **Downloads**    | Add / edit / delete free & premium files            |
| **Users**        | Change plan, set license expiry, device slots       |
| **Announcements**| Create / edit / delete site-wide banners            |
| **Pages**        | Edit homepage text, about page, contact info        |
| **Support**      | Reply to user support tickets                       |

---

## Troubleshooting

### `auth/unauthorized-domain`
Firebase Console → Authentication → Settings → Authorized domains → add your domain.

### Blank page on refresh
Check that `public/_redirects` contains: `/* /index.html 200`

### Firestore permission denied
Check `firestore.rules` is deployed. Check Firestore Indexes are created.

### Orders/Downloads not loading in Admin
Composite indexes must be deployed. See Step 3.
