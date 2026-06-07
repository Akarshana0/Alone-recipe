// Developer: AKARSHANA
// src/hooks/useUserData.js
import { useAuth } from "../context/AuthContext";

/**
 * useUserData — Convenience hook that returns the current user's
 * Firestore document data along with common derived values.
 *
 * Returns:
 *   userData      — raw Firestore user document
 *   currentUser   — Firebase Auth user object
 *   isPremium     — boolean: plan !== "free" AND not expired (from AuthContext)
 *   isExpired     — boolean: licenseExpiry is past
 *   daysRemaining — number | null
 *   loading       — boolean
 */
export function useUserData() {
  // BUG FIX: was recalculating isPremium independently from AuthContext,
  // causing inconsistent values across components. Now uses the single
  // source of truth from AuthContext.
  const { currentUser, userData, isPremium, loading } = useAuth();

  const daysRemaining = (() => {
    if (!userData?.licenseExpiry) return null;
    try {
      const expiry = userData.licenseExpiry.toDate
        ? userData.licenseExpiry.toDate()
        : new Date(userData.licenseExpiry);
      if (isNaN(expiry.getTime())) return 0;
      return Math.ceil((expiry - new Date()) / 86_400_000);
    } catch {
      return 0;
    }
  })();

  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return {
    userData,
    currentUser,
    isPremium,
    isExpired,
    daysRemaining,
    loading,
  };
}
