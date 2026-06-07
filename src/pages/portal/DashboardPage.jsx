// Developer: AKARSHANA
// src/pages/portal/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiShoppingBag, HiDownload, HiClipboardList,
  HiUserCircle, HiShieldCheck, HiClock,
  HiLightningBolt, HiExclamationCircle,
} from "react-icons/hi";
import { useUserData } from "../../hooks/useUserData";
import { subscribeUserOrders } from "../../firebase/firestore";

const QUICK_LINKS = [
  { to: "/portal/store",     label: "BROWSE STORE",   icon: HiShoppingBag,   desc: "View available packages" },
  { to: "/portal/downloads", label: "MY FILES",       icon: HiDownload,      desc: "Access your downloads"   },
  { to: "/portal/orders",    label: "MY ORDERS",      icon: HiClipboardList, desc: "Track your orders"        },
  { to: "/portal/profile",   label: "PROFILE",        icon: HiUserCircle,    desc: "Manage your account"      },
];

function PlanBadge({ plan }) {
  const styles = {
    free:    "bg-white/5 border-white/20 text-white/40",
    basic:   "bg-cyan/10 border-cyan/30 text-cyan",
    premium: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
    vip:     "bg-purple-400/10 border-purple-400/30 text-purple-400",
  };
  const s = styles[plan?.toLowerCase()] || styles.free;
  return (
    <span className={`inline-block px-3 py-1 rounded border font-mono text-xs tracking-widest uppercase ${s}`}>
      {plan || "FREE"}
    </span>
  );
}

export default function DashboardPage() {
  const { userData, currentUser, isPremium, daysRemaining, isExpired, loading } = useUserData();
  const [orders, setOrders] = useState([]);

  const uid = currentUser?.uid || userData?.id;

  useEffect(() => {
    if (!uid) return;
    // BUG FIX: missing onError — without it a Firestore failure leaves orders empty
    // with no indication of what went wrong.
    const unsub = subscribeUserOrders(
      uid,
      (data) => setOrders(data),
      (err) => { console.error("[Dashboard] Orders listener error:", err.message); }
    );
    return () => unsub();
  }, [uid]);

  const displayName =
    userData?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Xiter User";

  const pendingOrders  = orders.filter((o) => o.status === "pending").length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;

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
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="badge-cyan mb-3">PORTAL DASHBOARD</div>
          <h1 className="section-title text-2xl md:text-3xl text-white mb-1">
            WELCOME BACK, <span className="neon-text">{displayName.toUpperCase()}</span>
          </h1>
          <p className="text-white/40 text-sm font-rajdhani">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* License status banner */}
        {isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 glass-card p-4 border-red-400/30 bg-red-400/5 flex items-center gap-3"
          >
            <HiExclamationCircle className="text-red-400 shrink-0" size={20} />
            <div>
              <p className="font-orbitron text-xs font-bold text-red-400">LICENSE EXPIRED</p>
              <p className="text-white/50 text-xs mt-0.5">Your license has expired. Visit the store to renew.</p>
            </div>
            <Link to="/portal/store" className="ml-auto btn-cyber-filled py-2 px-4 text-xs shrink-0">
              RENEW
            </Link>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: HiShieldCheck,
              label: "PLAN",
              value: <PlanBadge plan={userData?.plan} />,
              color: "text-cyan",
            },
            {
              icon: HiClock,
              label: "DAYS LEFT",
              value: isPremium
                ? (daysRemaining !== null ? daysRemaining : "∞")
                : "—",
              color: daysRemaining !== null && daysRemaining <= 3 ? "text-red-400" : "text-cyan",
            },
            {
              icon: HiClipboardList,
              label: "PENDING ORDERS",
              value: pendingOrders,
              color: pendingOrders > 0 ? "text-yellow-400" : "text-white/40",
            },
            {
              icon: HiLightningBolt,
              label: "TOTAL ORDERS",
              value: orders.length,
              color: "text-cyan",
            },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="stat-block"
            >
              <Icon className={`${color} mb-2`} size={18} />
              <div className="font-mono text-white/30 text-xs mb-1">{label}</div>
              <div className={`font-orbitron font-bold text-lg ${color}`}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-orbitron text-xs text-white/30 tracking-widest mb-4">QUICK ACCESS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_LINKS.map(({ to, label, icon: Icon, desc }, i) => (
              <Link
                key={to}
                to={to}
                className="glass-card p-5 flex flex-col items-start gap-3 hover:border-cyan/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 border border-cyan/20 rounded-lg flex items-center justify-center text-cyan/50 group-hover:text-cyan group-hover:border-cyan/50 transition-all">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-orbitron text-xs font-bold text-white group-hover:text-cyan transition-colors">{label}</p>
                  <p className="text-white/30 text-xs mt-1 font-rajdhani">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent orders preview */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-xs font-bold text-white/60 tracking-widest">RECENT ORDERS</h2>
              <Link to="/portal/orders" className="text-cyan text-xs font-mono hover:text-white transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => {
                const statusColors = {
                  pending:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                  approved: "text-green-400 bg-green-400/10 border-green-400/20",
                  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
                };
                const s = statusColors[order.status] || statusColors.pending;
                return (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white/80 text-sm font-rajdhani font-semibold">
                        {order.items?.map((i) => i.name).join(", ") || "Order"}
                      </p>
                      <p className="text-white/30 text-xs font-mono mt-0.5">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded border font-mono text-xs ${s}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
