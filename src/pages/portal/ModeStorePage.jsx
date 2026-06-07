// Developer: AKARSHANA
// src/pages/portal/ModeStorePage.jsx — Public + Portal store page
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShoppingBag, HiCheckCircle, HiStar,
  HiLightningBolt, HiX, HiChat,
} from "react-icons/hi";
import { getPackages, createOrder } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// ─── Copy-to-clipboard button ─────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest border transition-all duration-200 ${
        copied
          ? "bg-green-400/20 border-green-400/40 text-green-400"
          : "bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20"
      }`}
    >
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}

// ─── Order confirmation modal ─────────────────────────────────
function OrderModal({ pkg, onClose, onConfirm, loading }) {
  const { currentUser, userData, rzUser } = useAuth();
  const displayName =
    userData?.displayName || currentUser?.displayName ||
    currentUser?.email?.split("@")[0] || rzUser?.username || "";

  const bankName    = import.meta.env.VITE_BANK_NAME;
  const bankHolder  = import.meta.env.VITE_BANK_HOLDER;
  const bankAccount = import.meta.env.VITE_BANK_ACCOUNT;
  const ezcash      = import.meta.env.VITE_EZCASH_NUMBER;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass-card p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <HiX size={20} />
        </button>

        {/* Header */}
        <div className="badge-cyan mb-3">CONFIRM ORDER</div>
        <h2 className="section-title text-xl text-white mb-1">{pkg.name}</h2>
        <p className="text-white/40 text-sm mb-5">{pkg.description}</p>

        {/* Order summary */}
        <div className="stat-block mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/50 font-rajdhani">Package</span>
            <span className="text-white font-semibold">{pkg.name}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/50 font-rajdhani">Duration</span>
            <span className="text-white">{pkg.duration}</span>
          </div>
          <div className="neon-divider my-3" />
          <div className="flex justify-between">
            <span className="text-white/50 font-rajdhani font-semibold">Total</span>
            <span className="neon-text font-orbitron font-bold text-xl">
              LKR {pkg.price?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Payment details ───────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-cyan/20" />
            <span className="font-orbitron text-[10px] text-cyan/60 tracking-widest">
              PAYMENT DETAILS
            </span>
            <div className="h-px flex-1 bg-cyan/20" />
          </div>

          {/* Bank section */}
          {(bankName || bankHolder || bankAccount) && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-orbitron font-bold text-white/30 tracking-widest uppercase">
                  🏦 Bank Transfer
                </span>
              </div>
              <div className="space-y-2.5">
                {bankName && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/40 font-rajdhani text-xs shrink-0">Bank</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white/80 font-mono text-xs truncate">{bankName}</span>
                      <CopyButton text={bankName} />
                    </div>
                  </div>
                )}
                {bankHolder && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/40 font-rajdhani text-xs shrink-0">Holder</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white/80 font-mono text-xs truncate">{bankHolder}</span>
                      <CopyButton text={bankHolder} />
                    </div>
                  </div>
                )}
                {bankAccount && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/40 font-rajdhani text-xs shrink-0">Account No.</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-mono text-sm font-bold tracking-wider">
                        {bankAccount}
                      </span>
                      <CopyButton text={bankAccount} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* eZCash section */}
          {ezcash && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-orbitron font-bold text-white/30 tracking-widest uppercase">
                  📱 eZCash / mCash
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/40 font-rajdhani text-xs shrink-0">Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan font-mono text-lg font-bold tracking-widest">
                    {ezcash}
                  </span>
                  <CopyButton text={ezcash} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instruction note */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 mb-5">
          <p className="text-yellow-400/80 text-xs font-mono leading-relaxed text-center">
            ⚠ Pay the amount above &amp; send payment screenshot on WhatsApp.
            License activated within a few hours.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-cyber flex-1 justify-center"
            disabled={loading}
          >
            CANCEL
          </button>
          <button
            onClick={() => onConfirm(pkg)}
            disabled={loading}
            className="btn-cyber-filled flex-1 justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                PLACING...
              </span>
            ) : "PLACE ORDER"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Package card ────────────────────────────────────────────
function PackageCard({ pkg, onOrder, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      viewport={{ once: true }}
      className={`glass-card p-6 flex flex-col relative overflow-hidden ${
        pkg.isPopular ? "border-cyan/40 shadow-neon-sm" : ""
      }`}
    >
      {/* Popular badge */}
      {pkg.isPopular && (
        <div className="absolute top-0 right-0 bg-cyan text-dark font-orbitron text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-orbitron text-sm font-bold text-white mb-1">{pkg.name}</h3>
          <span className="font-mono text-white/40 text-xs">{pkg.duration}</span>
        </div>
        <HiStar className={pkg.isPopular ? "text-cyan" : "text-white/20"} size={18} />
      </div>

      <p className="text-white/40 text-sm font-rajdhani leading-relaxed mb-5 flex-1">
        {pkg.description}
      </p>

      {/* Features */}
      {pkg.features?.length > 0 && (
        <ul className="space-y-2 mb-6">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-white/60 font-rajdhani">
              <HiCheckCircle className="text-cyan/60 shrink-0" size={14} />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="neon-divider" />

      <div className="flex items-center justify-between mt-4">
        <div>
          <span className="neon-text font-orbitron font-bold text-2xl">
            {pkg.price?.toLocaleString()}
          </span>
          <span className="text-white/30 text-xs font-mono ml-1">LKR</span>
        </div>
        <button
          onClick={() => onOrder(pkg)}
          className="btn-cyber-filled py-2 px-5 text-xs"
        >
          ORDER NOW
        </button>
      </div>
    </motion.div>
  );
}

export default function ModeStorePage() {
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [ordering, setOrdering] = useState(false);

  const { currentUser, userData, rzUser } = useAuth();
  const { toast: showToast } = useToast();

  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER;

  // BUG FIX: previously .catch(() => setPackages([])) was swallowing ALL errors
  // (Firestore permission denied, network failure, etc.) and showing them as
  // "no packages available" with no way to recover. Now we track the error state
  // separately and provide a retry button so users aren't stuck.
  const loadPackages = () => {
    setLoading(true);
    setError(false);
    getPackages()
      .then((pkgs) => { setPackages(pkgs); setError(false); })
      .catch((err) => {
        console.error("[Store] Failed to load packages:", err);
        setPackages([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleConfirmOrder = async (pkg) => {
    setOrdering(true);
    try {
      const uid  = currentUser?.uid || null;
      const name = userData?.displayName || currentUser?.displayName ||
                   currentUser?.email?.split("@")[0] || rzUser?.username || "Guest";
      const mail = currentUser?.email || rzUser?.email || "";

      await createOrder(uid, name, mail, [pkg], pkg.price);

      showToast("Order placed! Contact us on WhatsApp with payment proof.", "success");
      setSelected(null);

      // Open WhatsApp if number configured
      if (whatsapp) {
        const now  = new Date();
        const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

        const lines = [
          "╔══════════════════════╗",
          "       🛒 *NEW ORDER REQUEST*",
          "╚══════════════════════╝",
          "",
          `📦 *Package:* ${pkg.name}`,
          `⏱ *Duration:* ${pkg.duration || "N/A"}`,
          `💵 *Amount:* LKR ${pkg.price?.toLocaleString()}`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━",
          "👤 *Customer Details*",
          "━━━━━━━━━━━━━━━━━━━━━━",
          `🔖 Name: ${name}`,
          ...(mail ? [`📧 Email: ${mail}`] : []),
          "",
          `📅 Date: ${date}   🕐 ${time}`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━",
          "✅ *Payment screenshot attached below.*",
          "Please activate my license. Thank you! 🙏",
        ];
        const msg = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
      }
    } catch (err) {
      showToast("Failed to place order. Please try again.", "error");
      console.error("[Store] Order error:", err);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark bg-grid pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="badge-cyan mb-4">PACKAGES</div>
          <h1 className="section-title text-3xl md:text-4xl text-white mb-3">
            CHOOSE YOUR <span className="neon-text">PLAN</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Select a package that fits your needs. Payment via bank transfer or eZCash.
            License activated within hours after confirmation.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-cyan/40 text-xs tracking-widest">LOADING PACKAGES...</span>
          </div>
        ) : error ? (
          // BUG FIX: previously errors were shown as "no packages" with no way to recover.
          // Now shows a distinct error state with a retry button.
          <div className="text-center py-20">
            <HiShoppingBag className="text-red-400/30 mx-auto mb-4" size={48} />
            <p className="text-white/40 font-rajdhani mb-2">Failed to load packages.</p>
            <p className="text-white/20 font-mono text-xs mb-6">Check your connection and try again.</p>
            <button
              onClick={loadPackages}
              className="btn-cyber py-2 px-6 text-xs"
            >
              RETRY
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <HiShoppingBag className="text-white/10 mx-auto mb-4" size={48} />
            <p className="text-white/30 font-rajdhani mb-6">No packages available yet. Check back soon.</p>
            <button
              onClick={loadPackages}
              className="btn-cyber py-2 px-6 text-xs"
            >
              RETRY
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} onOrder={setSelected} index={i} />
            ))}
          </div>
        )}

        {/* Payment info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <HiLightningBolt className="text-cyan" size={18} />
            <h3 className="font-orbitron text-xs font-bold text-white tracking-wider">HOW TO ORDER</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/50 font-rajdhani">
            <div className="flex items-start gap-3">
              <span className="font-orbitron text-cyan font-bold text-xs mt-0.5">01</span>
              <p>Click <strong className="text-white/70">ORDER NOW</strong> on your chosen package and confirm.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-orbitron text-cyan font-bold text-xs mt-0.5">02</span>
              <p>Make payment via <strong className="text-white/70">bank transfer or eZCash</strong> and take a screenshot.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-orbitron text-cyan font-bold text-xs mt-0.5">03</span>
              <p>Send the screenshot on <strong className="text-white/70">WhatsApp</strong>. License activated within hours.</p>
            </div>
          </div>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 btn-cyber py-2 px-5 text-xs"
            >
              <HiChat size={14} />
              CONTACT ON WHATSAPP
            </a>
          )}
        </motion.div>

      </div>

      <AnimatePresence>
        {selected && (
          <OrderModal
            pkg={selected}
            onClose={() => setSelected(null)}
            onConfirm={handleConfirmOrder}
            loading={ordering}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
