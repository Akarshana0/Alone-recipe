// Developer: AKARSHANA
// src/pages/portal/OrdersPage.jsx — User order history
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiClipboardList, HiShoppingBag,
  HiCheckCircle, HiClock, HiXCircle,
} from "react-icons/hi";
import { subscribeUserOrders } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  pending:  { label: "PENDING",  color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/30", Icon: HiClock         },
  approved: { label: "APPROVED", color: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/30",  Icon: HiCheckCircle   },
  rejected: { label: "REJECTED", color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30",    Icon: HiXCircle       },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const { Icon, label, color, bg, border } = s;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs ${color} ${bg} ${border}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function OrderCard({ order, index }) {
  const [expanded, setExpanded] = useState(false);
  const date = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString()
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      className="glass-card overflow-hidden"
    >
      <button
        className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg border border-cyan/20 bg-cyan/5 flex items-center justify-center shrink-0">
            <HiShoppingBag className="text-cyan/60" size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-orbitron text-xs font-bold text-white truncate">
              {order.items?.map((i) => i.name).join(", ") || "Order"}
            </p>
            <p className="text-white/30 text-xs font-mono mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="neon-text font-orbitron font-bold text-sm hidden sm:block">
            LKR {order.total?.toLocaleString() || "—"}
          </span>
          <StatusBadge status={order.status} />
          <span className={`text-white/30 text-sm transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-white/5 p-5"
            style={{ overflow: "hidden" }}
          >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-white/30 font-mono text-xs mb-2">ORDER ITEMS</p>
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/70 font-rajdhani">{item.name}</span>
                  <span className="text-white/40 font-mono text-xs">LKR {item.price?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between mt-3">
                <span className="font-orbitron text-xs text-white/40">TOTAL</span>
                <span className="neon-text font-orbitron font-bold">LKR {order.total?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-white/30 font-mono text-xs mb-1">ORDER ID</p>
                <p className="font-mono text-xs text-white/50 break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-white/30 font-mono text-xs mb-1">STATUS</p>
                <StatusBadge status={order.status} />
              </div>
              {order.status === "pending" && (
                <div className="stat-block">
                  <p className="text-yellow-400/70 text-xs font-rajdhani">
                    💡 Please send your payment proof on WhatsApp to get your order approved.
                  </p>
                </div>
              )}
              {order.status === "approved" && (
                <div className="stat-block border-green-400/20">
                  <p className="text-green-400/70 text-xs font-rajdhani">
                    ✅ Order approved! Check your downloads for the latest files.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, rzUser, userData } = useAuth();

  // BUG FIX: RegzAuth-only users have no Firebase UID via currentUser.
  // userData is populated from Firestore when a linked Firebase account exists;
  // fall back to userData.id so orders still load for those sessions.
  const uid = currentUser?.uid || userData?.id || null;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeUserOrders(uid, (data) => {
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.error("[OrdersPage] Firestore error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const counts = {
    all:      orders.length,
    pending:  orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-dark bg-grid pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="badge-cyan mb-4">ORDER HISTORY</div>
          <h1 className="section-title text-3xl md:text-4xl text-white mb-3">
            MY <span className="neon-text">ORDERS</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Track your purchases and license activations.
          </p>
        </motion.div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "TOTAL",    value: counts.all,      color: "text-cyan"         },
              { label: "PENDING",  value: counts.pending,  color: "text-yellow-400"   },
              { label: "APPROVED", value: counts.approved, color: "text-green-400"    },
              { label: "REJECTED", value: counts.rejected, color: "text-red-400"      },
            ].map(({ label, value, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="stat-block text-center"
              >
                <p className={`font-orbitron font-bold text-2xl ${color}`}>{value}</p>
                <p className="font-mono text-white/30 text-xs mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-cyan/40 text-xs tracking-widest">LOADING ORDERS...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <HiClipboardList className="text-white/10 mx-auto mb-4" size={48} />
            <p className="text-white/30 font-rajdhani text-lg mb-2">No orders yet</p>
            <p className="text-white/20 text-sm mb-6">Visit the store to place your first order.</p>
            <Link to="/portal/store" className="btn-cyber-filled py-3 px-6">
              BROWSE STORE
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
