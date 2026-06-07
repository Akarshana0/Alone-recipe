// Developer: AKARSHANA
// src/context/AuthContext.jsx — supports Firebase Auth + RegzAuth sessions

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { subscribeUserData } from "../firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser,   setCurrentUser]   = useState(null);
  const [userData,      setUserData]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [sessionKicked, setSessionKicked] = useState(false);

  // RegzAuth-only session (no Firebase Auth token — Rex South username/password login)
  const [rzUser, setRzUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("rz_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const uidRef = useRef(null);

  useEffect(() => {
    let unsubData = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      uidRef.current = user?.uid || null;

      if (unsubData) { unsubData(); unsubData = null; }

      if (user) {
        let firstSnapshot = true;

        const safetyTimer = setTimeout(() => {
          if (firstSnapshot) {
            firstSnapshot = false;
            console.warn("[Auth] Firestore subscription timed out — forcing loading=false");
            setLoading(false);
          }
        }, 3000); // PERF: reduced from 8000ms — 3s is more than enough for Firestore cold-start

        unsubData = subscribeUserData(
          user.uid,
          async (data) => {
            // ── Device-aware session validation ───────────────────────
            // New behaviour: check if THIS device's entry still exists in
            // the `devices` array and its token matches localStorage.
            // Falls back to the old single-sessionToken check for accounts
            // that haven't logged in since the device panel was introduced.
            const deviceId   = localStorage.getItem("_did_" + user.uid);
            const localToken = localStorage.getItem("_st_"  + user.uid);
            const devices    = data?.devices;

            if (localToken) {
              const isAdmin = data?.role === "admin";
              if (deviceId && Array.isArray(devices) && devices.length > 0) {
                // Device-aware path ─────────────────────────────────────
                const thisDevice = devices.find((d) => d.id === deviceId);
                if (!thisDevice) {
                  // Device not found — could be stale localStorage after browser clear
                  if (isAdmin) {
                    // Admin: clear stale keys silently, let them stay logged in
                    // Session will be re-registered on next fresh login
                    localStorage.removeItem("_st_" + user.uid);
                    localStorage.removeItem("_did_" + user.uid);
                  } else {
                    // Regular user — device was revoked remotely
                    clearTimeout(safetyTimer);
                    localStorage.removeItem("_st_" + user.uid);
                    localStorage.removeItem("_did_" + user.uid);
                    setSessionKicked(true);
                    await signOut(auth);
                    return;
                  }
                } else if (localToken !== thisDevice.token) {
                  // Token mismatch — replaced by a newer login on this device
                  if (!isAdmin) {
                    clearTimeout(safetyTimer);
                    localStorage.removeItem("_st_" + user.uid);
                    setSessionKicked(true);
                    await signOut(auth);
                    return;
                  }
                  // Admin: just clear stale token, don't kick
                  localStorage.removeItem("_st_" + user.uid);
                }
              } else if (data?.sessionToken && localToken !== data.sessionToken) {
                // Legacy path: no devices array — use old sessionToken field
                if (!isAdmin) {
                  clearTimeout(safetyTimer);
                  localStorage.removeItem("_st_" + user.uid);
                  setSessionKicked(true);
                  await signOut(auth);
                  return;
                }
                // Admin: clear stale token silently
                localStorage.removeItem("_st_" + user.uid);
              }
            }
            // ── End session validation ────────────────────────────────
            setUserData(data);
            if (firstSnapshot) {
              firstSnapshot = false;
              clearTimeout(safetyTimer);
              setLoading(false);
            }
          },
          (error) => {
            console.warn("[Auth] Firestore subscription error:", error.message);
            if (firstSnapshot) {
              firstSnapshot = false;
              clearTimeout(safetyTimer);
              setLoading(false);
            }
          }
        );
      } else {
        // No Firebase user — check if there's a RegzAuth-only session
        setUserData(null);
        const rzRaw = sessionStorage.getItem("rz_user");
        if (rzRaw) {
          try { setRzUser(JSON.parse(rzRaw)); } catch { /* ignore */ }
        }
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubData) unsubData();
    };
  }, []);

  // ── Premium check ─────────────────────────────────────────────────────────
  // All logged-in users (Firebase Auth OR RegzAuth) are treated as premium.
  // Being signed in is the only requirement — no plan tier or expiry check.
  const isPremium = useMemo(() => {
    if (rzUser) return true;      // Rex South ID / email login
    if (currentUser) return true; // Firebase email/password or Google login
    return false;
  }, [currentUser, rzUser]);
  // ──────────────────────────────────────────────────────────────────────────

  // isRegzAuthSession: true when logged in via Rex South (no Firebase)
  const isRegzAuthSession = !currentUser && !!rzUser;

  return (
    <AuthContext.Provider value={{
      currentUser,
      userData,
      loading,
      isPremium,
      sessionKicked,
      uid: currentUser?.uid || null,
      // RegzAuth session extras
      rzUser,
      setRzUser,      // exposed so AuthPage can update state after login
      isRegzAuthSession,
    }}>
      {children}
      {sessionKicked && !loading && !currentUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 pointer-events-auto">
          <div className="bg-[#0d0d0d] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-orbitron text-red-400 text-sm tracking-widest mb-3">SESSION TERMINATED</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Your account was signed in from another device.<br />
              You have been logged out automatically.
            </p>
            <button
              onClick={() => { setSessionKicked(false); window.location.href = "/auth"; }}
              className="w-full py-3 bg-cyan/10 border border-cyan/30 text-cyan font-orbitron text-xs tracking-widest rounded-lg hover:bg-cyan/20 transition-all"
            >
              SIGN IN AGAIN
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
