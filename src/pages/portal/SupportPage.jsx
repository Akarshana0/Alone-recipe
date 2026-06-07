// Developer: AKARSHANA
// src/pages/portal/SupportPage.jsx — Support Ticket System (User Portal)

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSupport, HiPlus, HiX, HiChevronLeft,
  HiClock, HiCheckCircle, HiExclamationCircle,
  HiChat, HiPaperAirplane, HiRefresh,
  HiInformationCircle,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  createTicket, replyToTicket,
  subscribeUserTickets, markTicketReadByUser,
} from "../../firebase/tickets";

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES = [
  { value: "general",   label: "🌐 General" },
  { value: "billing",   label: "💳 Billing / Payments" },
  { value: "technical", label: "⚙️ Technical Issue" },
  { value: "account",   label: "👤 Account / License" },
];

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "text-white/40 border-white/20 bg-white/5"   },
  { value: "medium", label: "Medium", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5" },
  { value: "high",   label: "High",   color: "text-red-400 border-red-400/30 bg-red-400/5"   },
];

const STATUS_CFG = {
  open:        { label: "OPEN",        color: "text-cyan border-cyan/30 bg-cyan/5",               icon: HiChat },
  in_progress: { label: "IN PROGRESS", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5", icon: HiClock },
  resolved:    { label: "RESOLVED",    color: "text-green-400 border-green-400/30 bg-green-400/5",  icon: HiCheckCircle },
  closed:      { label: "CLOSED",      color: "text-white/30 border-white/20 bg-white/5",          icon: HiX },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-xs tracking-widest ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITIES.find((x) => x.value === priority) || PRIORITIES[0];
  return (
    <span className={`inline-block px-2 py-0.5 rounded border font-mono text-xs tracking-widest ${p.color}`}>
      {p.label.toUpperCase()}
    </span>
  );
}

// ─── Message Bubble ───────────────────────────────────────────
function MessageBubble({ msg }) {
  const isAdmin = msg.from === "admin";
  const time = msg.at?.toDate
    ? msg.at.toDate().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex ${isAdmin ? "justify-start" : "justify-end"} mb-3`}>
      <div className={`max-w-[80%] ${isAdmin ? "items-start" : "items-end"} flex flex-col gap-1`}>
        <div className={`flex items-center gap-2 ${isAdmin ? "" : "flex-row-reverse"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isAdmin ? "bg-cyan/20 text-cyan border border-cyan/30" : "bg-white/10 text-white/60 border border-white/20"
          }`}>
            {isAdmin ? "A" : "U"}
          </div>
          <span className="text-white/30 text-xs font-mono">{isAdmin ? "SUPPORT" : "YOU"}</span>
        </div>
        <div className={`px-4 py-3 rounded-xl text-sm font-rajdhani leading-relaxed ${
          isAdmin
            ? "bg-cyan/10 border border-cyan/20 text-white/90 rounded-tl-none"
            : "bg-white/5 border border-white/10 text-white/80 rounded-tr-none"
        }`}>
          {msg.text}
        </div>
        {time && <span className="text-white/20 text-xs font-mono">{time}</span>}
      </div>
    </div>
  );
}

// ─── Create Ticket Form ───────────────────────────────────────
function CreateTicketModal({ onClose, onCreated, user }) {
  const { toast: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: "", category: "general", priority: "medium", message: "",
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      showToast("Subject and message are required.", "error");
      return;
    }
    setLoading(true);
    try {
      await createTicket({
        uid:         user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        email:       user.email || "",
        subject:     form.subject.trim(),
        category:    form.category,
        priority:    form.priority,
        message:     form.message.trim(),
      });
      showToast("Ticket submitted! We'll reply soon.", "success");
      onCreated();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit ticket. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="glass-card p-6 sm:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <HiX size={20} />
        </button>

        <div className="badge-cyan mb-4">NEW TICKET</div>
        <h2 className="section-title text-xl text-white mb-6">SUBMIT SUPPORT REQUEST</h2>

        <div className="space-y-4">
          {/* Subject */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 font-mono tracking-wider">SUBJECT *</label>
            <input
              value={form.subject}
              onChange={set("subject")}
              placeholder="Brief description of your issue"
              maxLength={100}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 font-rajdhani"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50 font-mono tracking-wider">CATEGORY</label>
              <select
                value={form.category}
                onChange={set("category")}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50 font-mono tracking-wider">PRIORITY</label>
              <select
                value={form.priority}
                onChange={set("priority")}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 font-mono tracking-wider">MESSAGE *</label>
            <textarea
              value={form.message}
              onChange={set("message")}
              placeholder="Describe your issue in detail..."
              rows={5}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 resize-none font-rajdhani"
            />
            <span className="text-white/20 text-xs font-mono text-right">{form.message.length}/2000</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-cyber flex-1 justify-center" disabled={loading}>
              CANCEL
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn-cyber-filled flex-1 justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  SUBMITTING...
                </span>
              ) : "SUBMIT TICKET"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Ticket Detail View ───────────────────────────────────────
function TicketDetail({ ticket, onBack }) {
  const { toast: showToast } = useToast();
  const { currentUser, userData } = useAuth();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Mark as read when opened
  useEffect(() => {
    if (ticket.unreadUser) {
      markTicketReadByUser(ticket.id).catch(() => {});
    }
  }, [ticket.id, ticket.unreadUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages?.length]);

  const canReply = ticket.status !== "closed" && ticket.status !== "resolved";

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyToTicket(ticket.id, reply.trim());
      setReply("");
      showToast("Reply sent!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to send reply.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
  };

  const catLabel = CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category;
  const createdAt = ticket.createdAt?.toDate
    ? ticket.createdAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cyan/60 hover:text-cyan text-xs font-mono tracking-widest mb-4 transition-colors"
        >
          <HiChevronLeft size={16} /> BACK TO TICKETS
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-white/30 text-xs">#{ticket.id.slice(0, 8).toUpperCase()}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="font-orbitron text-base sm:text-lg font-bold text-white mb-1">{ticket.subject}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/30 font-mono">
              <span>{catLabel}</span>
              {createdAt && <span>Opened {createdAt}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="glass-card p-4 sm:p-6 flex-1 overflow-y-auto mb-4" style={{ maxHeight: "420px" }}>
        {(ticket.messages || []).map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply Box */}
      {canReply ? (
        <div className="glass-card p-4 sm:p-6">
          <label className="text-xs text-white/40 font-mono tracking-wider mb-2 block">REPLY</label>
          <div className="flex gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply... (Ctrl+Enter to send)"
              rows={3}
              maxLength={2000}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 resize-none font-rajdhani"
            />
            <button
              onClick={handleReply}
              disabled={sending || !reply.trim()}
              className="btn-cyber-filled px-4 self-end flex items-center gap-2 text-xs"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiPaperAirplane size={16} />
              )}
            </button>
          </div>
          <p className="text-white/20 text-xs font-mono mt-2">Ctrl + Enter to send</p>
        </div>
      ) : (
        <div className="glass-card p-4 flex items-center gap-3 border-white/10">
          <HiInformationCircle className="text-white/30 shrink-0" size={18} />
          <p className="text-white/30 text-sm font-rajdhani">
            This ticket is {ticket.status}. You cannot reply. Open a new ticket if needed.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Ticket List Item ─────────────────────────────────────────
function TicketRow({ ticket, onClick }) {
  const updatedAt = ticket.updatedAt?.toDate
    ? ticket.updatedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const catLabel = CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category;
  const msgCount = ticket.messages?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="glass-card p-4 sm:p-5 cursor-pointer hover:border-cyan/40 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-white/20 text-xs">#{ticket.id.slice(0, 8).toUpperCase()}</span>
            <StatusBadge status={ticket.status} />
            {ticket.unreadUser && (
              <span className="inline-block w-2 h-2 rounded-full bg-cyan animate-pulse" title="New reply" />
            )}
          </div>
          <p className="font-orbitron text-sm font-semibold text-white group-hover:text-cyan transition-colors truncate">
            {ticket.subject}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/30 font-mono">
            <span>{catLabel}</span>
            <span>·</span>
            <span>{msgCount} message{msgCount !== 1 ? "s" : ""}</span>
            {updatedAt && <><span>·</span><span>{updatedAt}</span></>}
          </div>
        </div>
        <PriorityBadge priority={ticket.priority} />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function SupportPage() {
  const { currentUser, userData } = useAuth();
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState("all");

  const uid = currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeUserTickets(uid, (data) => {
      setTickets(data);
      setLoading(false);
    }, (err) => {
      console.error("[SupportPage] Firestore error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Update selected ticket live
  useEffect(() => {
    if (!selected) return;
    const updated = tickets.find((t) => t.id === selected.id);
    if (updated) setSelected(updated);
  }, [tickets, selected]);

  const filtered = filter === "all"
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const statusCounts = {
    open:        tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved:    tickets.filter((t) => t.status === "resolved").length,
    closed:      tickets.filter((t) => t.status === "closed").length,
  };

  const unreadCount = tickets.filter((t) => t.unreadUser).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-cyan/50 text-xs tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark bg-grid pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Detail view */}
        {selected ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <TicketDetail
              ticket={selected}
              onBack={() => setSelected(null)}
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="badge-cyan mb-2">SUPPORT</div>
                <h1 className="section-title text-2xl md:text-3xl text-white">
                  MY <span className="neon-text">TICKETS</span>
                </h1>
                <p className="text-white/40 text-sm font-rajdhani mt-1">
                  Track your support requests and get help from our team.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-cyber-filled flex items-center gap-2 text-xs px-5 py-3"
              >
                <HiPlus size={16} /> NEW TICKET
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "OPEN",        count: statusCounts.open,        color: "text-cyan"        },
                { label: "IN PROGRESS", count: statusCounts.in_progress, color: "text-yellow-400"  },
                { label: "RESOLVED",    count: statusCounts.resolved,    color: "text-green-400"   },
                { label: "CLOSED",      count: statusCounts.closed,      color: "text-white/30"    },
              ].map(({ label, count, color }) => (
                <div key={label} className="stat-block text-center">
                  <div className={`font-orbitron text-xl font-bold ${color}`}>{count}</div>
                  <div className="font-mono text-white/30 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["all", "open", "in_progress", "resolved", "closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest transition-all ${
                    filter === f
                      ? "bg-cyan/20 border border-cyan/40 text-cyan"
                      : "border border-white/10 text-white/30 hover:text-white/60"
                  }`}
                >
                  {f === "all" ? "ALL" : f.replace("_", " ").toUpperCase()}
                  {f === "all" && unreadCount > 0 && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-cyan" />
                  )}
                </button>
              ))}
            </div>

            {/* Ticket list */}
            {filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <HiSupport className="text-white/10 mx-auto mb-4" size={48} />
                <p className="font-orbitron text-white/30 text-sm tracking-widest mb-2">NO TICKETS FOUND</p>
                <p className="text-white/20 text-xs font-rajdhani mb-6">
                  {filter === "all"
                    ? "You haven't submitted any support tickets yet."
                    : `No ${filter.replace("_", " ")} tickets.`}
                </p>
                {filter === "all" && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="btn-cyber-filled text-xs px-6 py-3"
                  >
                    OPEN FIRST TICKET
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => setSelected(ticket)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateTicketModal
            user={{
              uid:         currentUser?.uid,
              displayName: userData?.displayName || currentUser?.displayName || currentUser?.email?.split("@")[0],
              email:       currentUser?.email,
            }}
            onClose={() => setShowCreate(false)}
            onCreated={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
