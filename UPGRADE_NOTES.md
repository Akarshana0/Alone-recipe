# SAMURA EXIDER — Upgrade Notes
## What was changed / added:

### 1. Single Session Enforcement
- **Problem**: Multiple devices could log in simultaneously
- **Fix**: On login, a unique session token is saved to Firestore & localStorage
- **Behavior**: If another device logs in, the first device sees a "SESSION TERMINATED" popup and is auto-signed-out
- **Files changed**: `src/firebase/auth.js`, `src/context/AuthContext.jsx`



### 2. Orders System (NEW)
- **When user clicks CHECKOUT** in the store → order is automatically saved to Firestore (`orders` collection)
- **Admin panel** now has an **ORDERS tab** with:
  - View pending / confirmed / rejected / all orders
  - Badge counter on the tab for pending orders
  - CONFIRM / REJECT buttons
  - Delete order
  - Orange alert on Overview tab when pending orders exist
- **Files changed**: `src/firebase/firestore.js`, `src/firebase/admin.js`, `src/pages/admin/AdminPage.jsx`, `src/pages/portal/ModeStorePage.jsx`

### 3. Admin Panel — Overview Upgrade
- Now shows 5 stat cards including **Pending Orders**
- Clickable alert box routes to Orders tab when pending orders exist
- **Files changed**: `src/pages/admin/AdminPage.jsx`

### 4. Firestore Rules
- Added `orders` collection rules — users can create their own orders, admins manage all
- **Files changed**: `firestore.rules`

## Deployment checklist
1. Update `.env` with your Firebase credentials
2. `npm install && npm run build`
3. Deploy to Vercel (or `firebase deploy`)
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
