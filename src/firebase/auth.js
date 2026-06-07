// Developer: AKARSHANA
// src/firebase/auth.js -- Dual auth: Firebase Email + RegzAuth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc, setDoc, getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./config";
import { registerDeviceSession, revokeDevice } from "./firestore";

// -- Device helpers ----------------------------------------------------------
/** Returns a stable per-device ID stored in localStorage. */
export function getDeviceId(uid) {
  const key = "_did_" + uid;
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

/** Parses navigator.userAgent into a human-readable { browser, os } pair. */
function parseDeviceMeta() {
  const ua = navigator.userAgent;

  let browser = "Browser";
  if (/Edg\//.test(ua))         { const m = ua.match(/Edg\/(\d+)/);     browser = `Edge${m ? " " + m[1] : ""}`; }
  else if (/OPR\//.test(ua))    { const m = ua.match(/OPR\/(\d+)/);     browser = `Opera${m ? " " + m[1] : ""}`; }
  else if (/Chrome\//.test(ua)) { const m = ua.match(/Chrome\/(\d+)/);  browser = `Chrome${m ? " " + m[1] : ""}`; }
  else if (/Firefox\//.test(ua)){ const m = ua.match(/Firefox\/(\d+)/); browser = `Firefox${m ? " " + m[1] : ""}`; }
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if      (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows/.test(ua))       os = "Windows";
  else if (/iPhone/.test(ua))        os = "iPhone";
  else if (/iPad/.test(ua))          os = "iPad";
  else if (/Android/.test(ua))       os = "Android";
  else if (/Mac OS X/.test(ua))      os = "macOS";
  else if (/Linux/.test(ua))         os = "Linux";

  return { browser, os };
}

// -- Session token helpers ---------------------------------------------------
function generateSessionToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

async function setSessionToken(uid) {
  const token    = generateSessionToken();
  const deviceId = getDeviceId(uid);
  const { browser, os } = parseDeviceMeta();

  try {
    localStorage.setItem("_st_" + uid, token);
    await Promise.all([
      setDoc(doc(db, "users", uid), {
        sessionToken: token,
        lastLoginAt:  serverTimestamp(),
      }, { merge: true }),
      registerDeviceSession(uid, { deviceId, browser, os, token }),
    ]);
  } catch (err) {
    console.warn("[Session] Could not write session token:", err.message);
  }
  return token;
}

// -- Create user document ----------------------------------------------------
async function createUserDoc(user, extraData = {}) {
  try {
    const ref  = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:           user.uid,
        displayName:   user.displayName || extraData.displayName || "Xiter User",
        email:         user.email,
        photoURL:      user.photoURL || null,
        plan:          "free",
        licenseExpiry: null,
        activeDevices: 0,
        maxDevices:    1,
        sessionToken:  null,
        hwid:          null,
        createdAt:     serverTimestamp(),
        ...extraData,
      });
    }
  } catch (err) {
    console.warn("[UserDoc] Could not create user document:", err.message);
  }
}

// -- Email / Password Register -----------------------------------------------
export async function registerWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserDoc(cred.user, { displayName });
  await setSessionToken(cred.user.uid);
  return cred.user;
}

// -- Email / Password Login --------------------------------------------------
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await setSessionToken(cred.user.uid);
  return cred.user;
}

// -- Sign Out ----------------------------------------------------------------
export async function logout(uid) {
  if (uid) {
    const deviceId = localStorage.getItem("_did_" + uid);
    if (deviceId) revokeDevice(uid, deviceId).catch(() => {});
    localStorage.removeItem("_st_" + uid);
    localStorage.removeItem("_did_" + uid);
  }
  sessionStorage.removeItem("rz_user");
  sessionStorage.removeItem("rz_session");
  await signOut(auth);
}
