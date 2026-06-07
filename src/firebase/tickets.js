// Developer: AKARSHANA
// src/firebase/tickets.js — Support Ticket System (Firestore)
//
// Firestore structure:
//   /tickets/{ticketId}
//     uid          : string
//     displayName  : string
//     email        : string
//     subject      : string
//     category     : "billing" | "technical" | "general" | "account"
//     priority     : "low" | "medium" | "high"
//     status       : "open" | "in_progress" | "resolved" | "closed"
//     messages     : [{ from:"user"|"admin", text:string, at:Timestamp }]
//     createdAt    : Timestamp
//     updatedAt    : Timestamp
//     unreadAdmin  : boolean  — user sent a new message, admin hasn't seen it
//     unreadUser   : boolean  — admin replied, user hasn't seen it

import {
  collection, doc, addDoc, updateDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, arrayUnion, Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// ─── Create a new ticket (user) ──────────────────────────────
export async function createTicket({ uid, displayName, email, subject, category, priority, message }) {
  return await addDoc(collection(db, "tickets"), {
    uid,
    displayName: displayName || "User",
    email:       email       || "",
    subject:     subject     || "(no subject)",
    category:    category    || "general",
    priority:    priority    || "medium",
    status:      "open",
    messages: [
      {
        from: "user",
        text: message,
        at:   Timestamp.now(),
      },
    ],
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    unreadAdmin: true,
    unreadUser:  false,
  });
}

// ─── User reply on their own ticket ──────────────────────────
export async function replyToTicket(ticketId, text) {
  await updateDoc(doc(db, "tickets", ticketId), {
    messages:    arrayUnion({ from: "user", text, at: Timestamp.now() }),
    updatedAt:   serverTimestamp(),
    unreadAdmin: true,
    unreadUser:  false,
  });
}

// ─── Admin reply on a ticket ──────────────────────────────────
export async function adminReplyToTicket(ticketId, text, newStatus) {
  const payload = {
    messages:   arrayUnion({ from: "admin", text, at: Timestamp.now() }),
    updatedAt:  serverTimestamp(),
    unreadUser: true,
    unreadAdmin: false,
  };
  if (newStatus) payload.status = newStatus;
  await updateDoc(doc(db, "tickets", ticketId), payload);
}

// ─── Update ticket status (admin) ────────────────────────────
export async function updateTicketStatus(ticketId, status) {
  await updateDoc(doc(db, "tickets", ticketId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Mark ticket as read by user (clears unreadUser flag) ────
export async function markTicketReadByUser(ticketId) {
  await updateDoc(doc(db, "tickets", ticketId), { unreadUser: false });
}

// ─── Mark ticket as read by admin (clears unreadAdmin flag) ──
export async function markTicketReadByAdmin(ticketId) {
  await updateDoc(doc(db, "tickets", ticketId), { unreadAdmin: false });
}

// ─── Real-time: current user's tickets ───────────────────────
export function subscribeUserTickets(uid, callback, onError) {
  const q = query(
    collection(db, "tickets"),
    where("uid", "==", uid),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeUserTickets] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}

// ─── Real-time: ALL tickets (admin) ──────────────────────────
export function subscribeAllTickets(callback, statusFilter = null, onError = null) {
  let q;
  // Guard: if statusFilter is a function, it was passed as onError by mistake
  if (statusFilter && typeof statusFilter !== "function") {
    q = query(
      collection(db, "tickets"),
      where("status", "==", statusFilter),
      orderBy("updatedAt", "desc")
    );
  } else {
    // If statusFilter is a function, treat it as onError
    if (typeof statusFilter === "function" && !onError) onError = statusFilter;
    q = query(collection(db, "tickets"), orderBy("updatedAt", "desc"));
  }
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
    (err) => {
      console.error("[subscribeAllTickets] Firestore error:", err);
      if (onError) onError(err);
    }
  );
}
