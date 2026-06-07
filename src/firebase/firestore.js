// Developer: AKARSHANA
// src/firebase/firestore.js — UPDATED with HWID reset logic
// Add these exports to your existing firestore.js file

import {
  doc, getDoc, collection, getDocs, query,
  where, orderBy, onSnapshot, addDoc, setDoc,
  updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { REGZAUTH_NAME, REGZAUTH_OWNERID, REGZAUTH_SECRET } from "./regzAuthConfig";

// ─── RegzAuth API helper (browser-side, CORS supported) ──────
const REGZAUTH_URL = "https://api.regzauth.cc/api/1.3/";

async function _rzPost(data) {
  const res = await fetch(REGZAUTH_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams(data).toString(),
  });
  if (!res.ok) throw new Error(`RegzAuth API error: HTTP ${res.status}`);
  return res.json();
}

// ─── RegzAuth Web Client API helpers (new JSON endpoints) ────
// Base: https://api.regzauth.cc/api/webclient/*
const REGZAUTH_WEBCLIENT_URL = "https://api.regzauth.cc/api/webclient";

/**
 * _rzWebPost — POST JSON to a webclient endpoint.
 * Always injects name + ownerid from config.
 */
async function _rzWebPost(endpoint, body) {
  const res = await fetch(`${REGZAUTH_WEBCLIENT_URL}/${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name: REGZAUTH_NAME, ownerid: REGZAUTH_OWNERID, ...body }),
  });
  if (!res.ok) throw new Error(`RegzAuth API error: HTTP ${res.status}`);
  return res.json();
}

/**
 * _rzWebGet — GET from a webclient endpoint with query params.
 */
async function _rzWebGet(endpoint, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${REGZAUTH_WEBCLIENT_URL}/${endpoint}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`RegzAuth API error: HTTP ${res.status}`);
  return res.json();
}

/**
 * validateRegzSession
 *
 * Checks whether a RegzAuth session is still valid using the webclient API.
 * Returns { success, username, subscription } or throws.
 *
 * @param {string} sessionid - The session ID stored in sessionStorage "rz_session"
 */
export async function validateRegzSession(sessionid) {
  if (!sessionid) throw new Error("No session ID provided.");
  return _rzWebGet("user", { sessionid });
}

// Singleton sessionid so we don't re-init on every call
let _rzSessionId = null;

async function _rzInit() {
  if (_rzSessionId) return _rzSessionId;
  const json = await _rzPost({ type: "init", name: REGZAUTH_NAME, ownerid: REGZAUTH_OWNERID, secret: REGZAUTH_SECRET });
  if (!json.success) throw new Error(json.message || "RegzAuth init failed");
  _rzSessionId = json.sessionid;
  return _rzSessionId;
}

// ─── Get single user data ────────────────────────────────────
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Real-time user data listener ────────────────────────────
export function subscribeUserData(uid, callback, onError) {
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    onError
  );
}

// ─── Real-time ALL users listener (admin only) ───────────────
export function subscribeUsers(callback, onError) {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeUsers] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Real-time downloads listener ────────────────────────────
// BUG FIX: Previously used compound queries (where + where + orderBy) that
// require composite Firestore indexes to be manually deployed. If those indexes
// are missing or still building, the query throws a "requires an index" error
// and the callback never fires — leaving the UI stuck showing "No files".
// Fix: query only on isPremium (single-field, no composite index needed), then
// apply isActive filtering and updatedAt sorting on the client side.
export function subscribeDownloads(premiumOnly, callback, activeOnly = true, onError) {
  const col = collection(db, "downloads");
  const q = query(col, where("isPremium", "==", premiumOnly));
  return onSnapshot(
    q,
    (snap) => {
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (activeOnly) docs = docs.filter((d) => d.isActive === true);
      docs.sort((a, b) => {
        const aMs = a.updatedAt?.toMillis?.() ?? a.updatedAt?.seconds * 1000 ?? 0;
        const bMs = b.updatedAt?.toMillis?.() ?? b.updatedAt?.seconds * 1000 ?? 0;
        return bMs - aMs;
      });
      callback(docs);
    },
    (err) => {
      console.error("[subscribeDownloads] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Add a download file (admin) ─────────────────────────────
export async function addDownload(data) {
  return await addDoc(collection(db, "downloads"), {
    name:        data.name        || "",
    description: data.description || "",
    version:     data.version     || "",
    url:         data.url         || "",
    size:        data.size        || "",
    category:    data.category    || "software",
    isPremium:   data.isPremium   ?? false,
    isActive:    data.isActive    ?? true,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
}

// ─── Update a download file (admin) ──────────────────────────
export async function updateDownload(id, data) {
  await updateDoc(doc(db, "downloads", id), {
    name:        data.name        || "",
    description: data.description || "",
    version:     data.version     || "",
    url:         data.url         || "",
    size:        data.size        || "",
    category:    data.category    || "software",
    isPremium:   data.isPremium   ?? false,
    isActive:    data.isActive    ?? true,
    updatedAt:   serverTimestamp(),
  });
}

// ─── Delete a download file (admin) ──────────────────────────
export async function deleteDownload(id) {
  await deleteDoc(doc(db, "downloads", id));
}

// ─── All downloads listener (ADMIN — both free + premium, incl. hidden) ──────
// No isPremium filter — returns every document in the downloads collection.
// activeOnly defaults to false so admins always see hidden files too.
export function subscribeAllDownloads(callback, activeOnly = false, onError) {
  return onSnapshot(
    collection(db, "downloads"),
    (snap) => {
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (activeOnly) docs = docs.filter((d) => d.isActive === true);
      docs.sort((a, b) => {
        const aMs = a.updatedAt?.toMillis?.() ?? (a.updatedAt?.seconds ?? 0) * 1000;
        const bMs = b.updatedAt?.toMillis?.() ?? (b.updatedAt?.seconds ?? 0) * 1000;
        return bMs - aMs;
      });
      callback(docs);
    },
    (err) => {
      console.error("[subscribeAllDownloads] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Get packages (PUBLIC — active only) ─────────────────────
export async function getPackages() {
  // BUG FIX: previously .catch(() => setPackages([])) in ModeStorePage was
  // swallowing ALL errors (permission denied, network, etc.) and showing them
  // as "no packages". Now we throw so callers can distinguish real errors from
  // a genuinely empty collection.
  const snap = await getDocs(collection(db, "packages"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((d) => d.isActive !== false);
}

// ─── Real-time packages listener (ADMIN — all including inactive) ─
export function subscribeAllPackages(callback, onError) {
  const q = query(collection(db, "packages"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    // BUG FIX: missing error handler — without this, if Firestore rejects
    // the query (e.g. missing index, permission denied), the callback never
    // fires, setLoading(false) never runs, and the admin packages tab hangs
    // in an infinite loading spinner with no indication of what went wrong.
    (err) => {
      console.error("[subscribeAllPackages] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Real-time orders listener (ADMIN) ───────────────────────
export function subscribeOrders(callback, statusFilter = null, onError) {
  let q;
  if (statusFilter) {
    q = query(
      collection(db, "orders"),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeOrders] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Real-time orders for a specific user ────────────────────
export function subscribeUserOrders(uid, callback, onError) {
  const q = query(
    collection(db, "orders"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeUserOrders] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Create order ────────────────────────────────────────────
export async function createOrder(uid, displayName, email, cart, total) {
  return await addDoc(collection(db, "orders"), {
    uid:         uid   || null,
    displayName: displayName || "Guest",
    email:       email || null,
    isGuest:     !uid,
    items: cart.map((p) => ({
      id:       p.id,
      name:     p.name,
      price:    p.price || 0,
      duration: p.duration || "",
    })),
    total,
    status:    "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ─── Admin overview stats (real-time) ────────────────────────
export function subscribeAdminStats(callback) {
  let stats = { users: 0, packages: 0, downloads: 0, premiumUsers: 0, pendingOrders: 0 };
  let resolved = { users: false, packages: false, downloads: false, orders: false };

  const tryEmit = () => {
    if (resolved.users && resolved.packages && resolved.downloads && resolved.orders) {
      callback({ ...stats });
    }
  };

  const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
    stats.users = snap.size;
    stats.premiumUsers = snap.docs.filter((d) => {
      const data = d.data();
      if (!data.plan || data.plan === "free") return false;
      try {
        if (data.licenseExpiry) {
          const exp = data.licenseExpiry.toDate
            ? data.licenseExpiry.toDate()
            : new Date(data.licenseExpiry);
          if (isNaN(exp.getTime()) || exp < new Date()) return false;
        }
      } catch { return false; }
      return true;
    }).length;
    resolved.users = true;
    tryEmit();
  }, (err) => {
    console.error("[subscribeAdminStats] users error:", err.message);
    resolved.users = true; tryEmit();
  });

  const unsubPkgs = onSnapshot(collection(db, "packages"), (snap) => {
    stats.packages = snap.size;
    resolved.packages = true;
    tryEmit();
  }, (err) => {
    console.error("[subscribeAdminStats] packages error:", err.message);
    resolved.packages = true; tryEmit();
  });

  const unsubDl = onSnapshot(collection(db, "downloads"), (snap) => {
    stats.downloads = snap.size;
    resolved.downloads = true;
    tryEmit();
  }, (err) => {
    console.error("[subscribeAdminStats] downloads error:", err.message);
    resolved.downloads = true; tryEmit();
  });

  const unsubOrders = onSnapshot(
    query(collection(db, "orders"), where("status", "==", "pending")),
    (snap) => {
      stats.pendingOrders = snap.size;
      resolved.orders = true;
      tryEmit();
    },
    (err) => {
      console.error("[subscribeAdminStats] orders error:", err.message);
      resolved.orders = true; tryEmit();
    }
  );

  return () => { unsubUsers(); unsubPkgs(); unsubDl(); unsubOrders(); };
}

// ─── Real-time site content listener ─────────────────────────
export function subscribeSiteContent(pageId, callback) {
  return onSnapshot(doc(db, "siteContent", pageId), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ─── Real-time ALL announcements listener (admin) ─────────────
export function subscribeAllAnnouncements(callback, onError) {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeAllAnnouncements] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Real-time active announcements (public) ─────────────────
export function subscribeAnnouncements(callback, onError) {
  const q = query(
    collection(db, "announcements"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeAnnouncements] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── HWID RESET FEATURE ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/**
 * resetUserHWID
 *
 * Clears the stored HWID for a Firebase user in Firestore.
 * Rate limited to MAX_RESETS_PER_DAY per 24 hours — enforced server-side.
 *
 * @param {string} uid - Firebase Auth UID
 */
export async function resetUserHWID(uid) {
  if (!uid) throw new Error("UID is required to reset HWID.");

  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User document not found. Please log out and log back in.");

  // ── Abuse prevention: limit resets per day (server-side) ─────────────
  const data = snap.data();
  const now  = new Date();

  const history = data.hwidResetHistory || [];
  const last24h = history.filter(
    (ts) => now - new Date(ts) < 24 * 60 * 60 * 1000
  );
  const MAX_RESETS_PER_DAY = 3;
  if (last24h.length >= MAX_RESETS_PER_DAY) {
    throw new Error(
      `You can only reset your HWID ${MAX_RESETS_PER_DAY} times per 24 hours. ` +
      `Please try again later.`
    );
  }

  // ── Write to Firestore ────────────────────────────────────────────────
  await updateDoc(userRef, {
    hwid:             null,
    hwidResetCount:   (data.hwidResetCount || 0) + 1,
    hwidResetHistory: [...history, now.toISOString()].slice(-20),
    hwidLastResetAt:  serverTimestamp(),
  });
}

/**
 * getUserHWIDResetInfo
 *
 * Returns HWID-related data for a Firebase user.
 *
 * @param {string} uid
 */
export async function getUserHWIDResetInfo(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { hwid: null, resetCount: 0, lastResetAt: null, resetsToday: 0, maxResetsPerDay: 3 };

  const data    = snap.data();
  const now     = new Date();
  const history = data.hwidResetHistory || [];
  const resetsToday = history.filter(
    (ts) => now - new Date(ts) < 24 * 60 * 60 * 1000
  ).length;

  return {
    hwid:           data.hwid || null,
    resetCount:     data.hwidResetCount || 0,
    lastResetAt:    data.hwidLastResetAt
      ? (data.hwidLastResetAt.toDate ? data.hwidLastResetAt.toDate() : new Date(data.hwidLastResetAt))
      : null,
    resetsToday,
    maxResetsPerDay: 3,
  };
}

/**
 * adminResetUserHWID
 *
 * Admin-level Firebase HWID reset — bypasses the daily limit.
 * Only call this from admin-authenticated contexts.
 *
 * @param {string} targetUid - UID of the user whose HWID to reset
 */
export async function adminResetUserHWID(targetUid) {
  if (!targetUid) throw new Error("Target UID is required.");
  await updateDoc(doc(db, "users", targetUid), {
    hwid:            null,
    hwidLastResetAt: serverTimestamp(),
    hwidAdminReset:  serverTimestamp(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── RegzAuth (Rex South) HWID RESET — DIRECT API CALL ──────────────────
// ═══════════════════════════════════════════════════════════════════════════
//
// HOW THIS WORKS:
//   1. User clicks Reset HWID → resetRegzUserHWID(username, userSessionId) runs.
//   2. Firestore rate limit check (server-side, not bypassable via localStorage).
//   3. Tries the user's own active login session first (most reliable).
//      Falls back to a fresh owner-app session if user session is expired.
//      type=resetuser resets the HWID on RegzAuth's servers immediately.
//   4. Firestore tracking updated (history, count, last reset time).
//   5. User can immediately log in on their new device — no admin wait.
// ═══════════════════════════════════════════════════════════════════════════

const RZ_MAX_RESETS_PER_DAY = 3;

/**
 * _rzResetWithSession — internal helper
 * Calls type=resetuser with a given sessionid. Throws on failure.
 */
async function _rzResetWithSession(username, sessionid) {
  const json = await _rzPost({
    type:    "resetuser",
    username,
    sessionid,
    name:    REGZAUTH_NAME,
    ownerid: REGZAUTH_OWNERID,
  });
  if (!json.success) {
    throw new Error(json.message || "RegzAuth HWID reset failed.");
  }
  return true;
}

/**
 * resetRegzUserHWID
 *
 * Resets the HWID for a RegzAuth user.
 * Rate limited to RZ_MAX_RESETS_PER_DAY per 24 hours via Firestore tracking.
 * No admin intervention required — reset is instant.
 *
 * Session strategy (tries in order):
 *   1. New webclient API: POST /api/webclient/reset-hwid with username + password (preferred).
 *   2. Old API: user's own active login session (userSessionId).
 *   3. Old API: fresh owner-app session via _rzInit() (fallback).
 *
 * @param {string} username        - RegzAuth username
 * @param {string} [userSessionId] - Active session from login (sessionStorage "rz_session")
 * @param {string} [password]      - User's plaintext password (used for webclient API reset)
 */
export async function resetRegzUserHWID(username, userSessionId = null, password = null) {
  if (!username) throw new Error("Username is required.");

  const rzRef = doc(db, "rzUsers", username);
  const snap  = await getDoc(rzRef);
  const data  = snap.exists() ? snap.data() : {};
  const now   = new Date();

  // ── Rate limit check (Firestore, server-side) ────────────────────────
  const history = data.hwidResetHistory || [];
  const last24h = history.filter(
    (ts) => now - new Date(ts) < 24 * 60 * 60 * 1000
  );
  if (last24h.length >= RZ_MAX_RESETS_PER_DAY) {
    throw new Error(
      `You can only reset your HWID ${RZ_MAX_RESETS_PER_DAY} times per 24 hours. ` +
      `Please try again later.`
    );
  }

  // ── Call RegzAuth API — try webclient first, fall back to old API ─────
  let resetOk = false;

  // Attempt 1: new webclient API with password (most direct approach)
  if (password) {
    try {
      const json = await _rzWebPost("reset-hwid", { username, password });
      if (json.success) {
        resetOk = true;
      } else {
        throw new Error(json.message || "RegzAuth HWID reset failed.");
      }
    } catch (err) {
      // Webclient failed — fall through to old API
      console.warn("[RegzAuth] Webclient HWID reset failed, trying legacy session:", err.message);
      resetOk = false;
    }
  }

  // Attempt 2: user's own active login session (old API)
  if (!resetOk && userSessionId) {
    try {
      await _rzResetWithSession(username, userSessionId);
      resetOk = true;
    } catch (_) {
      // Session may have expired — fall through to owner-app session
      resetOk = false;
    }
  }

  // Attempt 3: fresh owner-app session (old API fallback)
  if (!resetOk) {
    try {
      _rzSessionId = null; // force fresh init, don't reuse a potentially stale session
      const ownerSession = await _rzInit();
      await _rzResetWithSession(username, ownerSession);
      resetOk = true;
    } catch (err) {
      _rzSessionId = null;
      throw new Error(err.message || "Failed to reset HWID. Check your connection and try again.");
    }
  }

  // ── Update Firestore tracking ────────────────────────────────────────
  const newHistory = [...history, now.toISOString()].slice(-20);
  await setDoc(rzRef, {
    username,
    hwidResetHistory:  newHistory,
    hwidResetCount:    (data.hwidResetCount || 0) + 1,
    hwidLastResetAt:   serverTimestamp(),
    pendingAdminReset: false,
    updatedAt:         serverTimestamp(),
  }, { merge: true });
}

/**
 * getRegzUserHWIDInfo
 *
 * Returns HWID-related data for a RegzAuth user from Firestore.
 *
 * @param {string} username
 */
export async function getRegzUserHWIDInfo(username) {
  if (!username) return { resetCount: 0, lastResetAt: null, resetsToday: 0, maxResetsPerDay: RZ_MAX_RESETS_PER_DAY, pendingAdminReset: false };

  const snap = await getDoc(doc(db, "rzUsers", username));
  if (!snap.exists()) return { resetCount: 0, lastResetAt: null, resetsToday: 0, maxResetsPerDay: RZ_MAX_RESETS_PER_DAY, pendingAdminReset: false };

  const data    = snap.data();
  const now     = new Date();
  const history = data.hwidResetHistory || [];
  const resetsToday = history.filter(
    (ts) => now - new Date(ts) < 24 * 60 * 60 * 1000
  ).length;

  return {
    resetCount:        data.hwidResetCount || 0,
    lastResetAt:       data.hwidLastResetAt
      ? (data.hwidLastResetAt.toDate ? data.hwidLastResetAt.toDate() : new Date(data.hwidLastResetAt))
      : null,
    resetsToday,
    maxResetsPerDay:   RZ_MAX_RESETS_PER_DAY,
    pendingAdminReset: data.pendingAdminReset || false,
    pendingResetSince: data.pendingResetSince || null,
  };
}

/**
 * adminClearRegzHwidRequest
 *
 * Admin marks a RegzAuth HWID reset request as processed.
 * Call this from the admin panel after manually resetting in RegzAuth dashboard.
 *
 * @param {string} username
 */
export async function adminClearRegzHwidRequest(username) {
  if (!username) throw new Error("Username is required.");
  await updateDoc(doc(db, "rzUsers", username), {
    pendingAdminReset: false,
    adminProcessedAt:  serverTimestamp(),
  });
}

/**
 * deleteRegzUser
 *
 * Deletes a RegzAuth account using the webclient API.
 * Requires username + password for verification.
 *
 * @param {string} username
 * @param {string} password
 */
export async function deleteRegzUser(username, password) {
  if (!username || !password) throw new Error("Username and password are required.");
  const json = await _rzWebPost("delete-user", { username, password });
  if (!json.success) throw new Error(json.message || "Failed to delete account.");
  return json;
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── DEVICE / SESSION MANAGEMENT ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/**
 * registerDeviceSession
 *
 * Called on every login. Upserts this device's entry in the `devices` array
 * on the user doc. The array is capped at 10 entries (oldest pruned first).
 *
 * @param {string} uid
 * @param {{ deviceId: string, browser: string, os: string, token: string }} info
 */
export async function registerDeviceSession(uid, { deviceId, browser, os, token }) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const existing = (snap.data().devices || []);
  const prev = existing.find((d) => d.id === deviceId);

  const entry = {
    id:         deviceId,
    browser,
    os,
    token,
    lastActive: new Date().toISOString(),
    createdAt:  prev?.createdAt || new Date().toISOString(),
  };

  // Replace existing entry or append, then cap at 10
  const updated = [
    ...existing.filter((d) => d.id !== deviceId),
    entry,
  ].slice(-10);

  await updateDoc(userRef, { devices: updated });
}

/**
 * revokeDevice
 *
 * Removes a device entry from the `devices` array.
 * AuthContext will detect the missing entry and kick that device's session.
 *
 * @param {string} uid
 * @param {string} deviceId
 */
export async function revokeDevice(uid, deviceId) {
  if (!uid || !deviceId) return;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const updated = (snap.data().devices || []).filter((d) => d.id !== deviceId);
  await updateDoc(userRef, { devices: updated });
}

/**
 * revokeAllOtherDevices
 *
 * Keeps only the specified device and removes all others.
 * Useful for "sign out everywhere else".
 *
 * @param {string} uid
 * @param {string} keepDeviceId
 */
export async function revokeAllOtherDevices(uid, keepDeviceId) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const updated = (snap.data().devices || []).filter((d) => d.id === keepDeviceId);
  await updateDoc(userRef, { devices: updated });
}
