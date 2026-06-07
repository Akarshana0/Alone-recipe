// Developer: AKARSHANA
// src/firebase/admin.js
import {
  doc, collection, addDoc, updateDoc, setDoc,
  deleteDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// ── Packages ──────────────────────────────────────────────────

export async function addPackage(data) {
  return await addDoc(collection(db, "packages"), {
    name:        data.name        || "",
    description: data.description || "",
    price:       Number(data.price) || 0,
    duration:    data.duration    || "",
    features:    data.features    || [],
    // BUG FIX: imageUrl, badgeText, category were missing — admin form saves
    // these fields but addPackage() was dropping them silently.
    imageUrl:    data.imageUrl    || "",
    badgeText:   data.badgeText   || "",
    category:    data.category    || "mode",
    isPopular:   data.isPopular   || false,
    isActive:    data.isActive    ?? true,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
}

export async function updatePackage(id, data) {
  await updateDoc(doc(db, "packages", id), {
    ...data,
    price:     Number(data.price) || 0,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePackage(id) {
  await deleteDoc(doc(db, "packages", id));
}

// ── Downloads ─────────────────────────────────────────────────

export async function addDownload(data) {
  return await addDoc(collection(db, "downloads"), {
    name:        data.name        || "",
    description: data.description || "",
    version:     data.version     || "",
    url:         data.url         || "",
    size:        data.size        || "",   // BUG FIX: was missing — portal shows blank file size
    category:    data.category    || "software",
    isPremium:   data.isPremium   ?? false,
    isActive:    data.isActive    ?? true,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
}

export async function updateDownload(id, data) {
  await updateDoc(doc(db, "downloads", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDownload(id) {
  await deleteDoc(doc(db, "downloads", id));
}

// ── Users (plan, license, devices) ────────────────────────────

export async function updateUser(uid, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };

  if (data.licenseExpiry && typeof data.licenseExpiry === "string") {
    // BUG FIX: bare "YYYY-MM-DD" parses as UTC midnight, so in IST (UTC+5:30) the
    // license would expire 5.5 hours early. Appending T23:59:59 makes it expire at
    // end-of-day in the server's local time, which is the intuitive admin intention.
    const d = new Date(data.licenseExpiry + "T23:59:59");
    if (!isNaN(d.getTime())) {
      payload.licenseExpiry = Timestamp.fromDate(d);
    } else {
      delete payload.licenseExpiry;
    }
  }
  if (data.licenseExpiry === "") {
    payload.licenseExpiry = null;
  }

  await updateDoc(doc(db, "users", uid), payload);
}

// ── Orders (Confirm / Reject) ─────────────────────────────────

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(orderId) {
  await deleteDoc(doc(db, "orders", orderId));
}

// ── Site Content (page sections) ──────────────────────────────

export async function updateSiteContent(pageId, data) {
  await setDoc(doc(db, "siteContent", pageId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Announcements ─────────────────────────────────────────────

export async function addAnnouncement(data) {
  return await addDoc(collection(db, "announcements"), {
    title:     data.title     || "",
    message:   data.message   || "",
    type:      data.type      || "info",   // info | warning | success | danger
    link:      data.link      || "",
    linkLabel: data.linkLabel || "",
    isActive:  data.isActive  ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAnnouncement(id, data) {
  await updateDoc(doc(db, "announcements", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, "announcements", id));
}

// ── Nav Links ─────────────────────────────────────────────────

export async function updateNavLinks(links) {
  await setDoc(doc(db, "siteContent", "navigation"), {
    links,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Contact Info ──────────────────────────────────────────────

export async function updateContactInfo(data) {
  await setDoc(doc(db, "siteContent", "contact"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Home Page Content ─────────────────────────────────────────

export async function updateHomeContent(data) {
  await setDoc(doc(db, "siteContent", "home"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── About Page Content ────────────────────────────────────────

export async function updateAboutContent(data) {
  await setDoc(doc(db, "siteContent", "about"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
