// Developer: AKARSHANA
// src/pages/portal/SecureDownloadsPage.jsx — Premium-only downloads
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiDownload, HiExternalLink, HiLockClosed,
  HiShieldCheck, HiRefresh,
} from "react-icons/hi";
import { subscribeDownloads } from "../../firebase/firestore";
import { useUserData } from "../../hooks/useUserData";

function FileCard({ file, isPremium, index }) {
  const canDownload = isPremium || !file.isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      viewport={{ once: true }}
      className={`glass-card p-5 flex items-start gap-4 ${!canDownload ? "opacity-60" : ""}`}
    >
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
        canDownload
          ? "border-cyan/30 text-cyan bg-cyan/5"
          : "border-white/10 text-white/30"
      }`}>
        {canDownload ? <HiDownload size={18} /> : <HiLockClosed size={18} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-orbitron text-xs font-bold text-white">{file.name}</h3>
          {file.version && (
            <span className="badge-cyan text-xs">{file.version}</span>
          )}
          {file.isPremium && (
            <span className="inline-block px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 rounded text-yellow-400 font-mono text-xs">
              PREMIUM
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs font-rajdhani leading-relaxed mb-3">
          {file.description || "No description provided."}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {file.size && (
            <span className="text-white/25 font-mono text-xs">{file.size}</span>
          )}
          {file.updatedAt && (
            <span className="text-white/25 font-mono text-xs">
              Updated: {file.updatedAt.toDate
                ? file.updatedAt.toDate().toLocaleDateString()
                : file.updatedAt}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {canDownload && file.url ? (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber-filled py-2 px-4 text-xs flex items-center gap-2"
          >
            <HiExternalLink size={14} />
            DOWNLOAD
          </a>
        ) : !canDownload ? (
          <Link to="/portal/store" className="btn-cyber py-2 px-4 text-xs flex items-center gap-2">
            <HiLockClosed size={14} />
            UPGRADE
          </Link>
        ) : (
          <span className="text-white/20 font-mono text-xs">NO LINK</span>
        )}
      </div>
    </motion.div>
  );
}

export default function SecureDownloadsPage() {
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { isPremium, isExpired } = useUserData();

  useEffect(() => {
    // Subscribe to ALL downloads (both free + premium) for portal view.
    // BUG FIX: replaced shared `loaded` counter (stale closure — only fired once,
    // subsequent real-time updates were ignored) with per-subscription ref objects
    // so every snapshot — initial or live-update — merges and re-renders correctly.
    let freeFiles    = null;
    let premiumFiles = null;

    const merge = () => {
      if (freeFiles === null || premiumFiles === null) return; // wait for both
      setFiles([
        ...premiumFiles,
        ...freeFiles.filter((f) => !premiumFiles.some((p) => p.id === f.id)),
      ]);
      setLoading(false);
    };

    const onError = (err) => {
      console.error("[SecureDownloads] Firestore error:", err);
      // Even on error, unblock the UI
      if (freeFiles    === null) freeFiles    = [];
      if (premiumFiles === null) premiumFiles = [];
      merge();
    };
    const unsubFree    = subscribeDownloads(false, (d) => { freeFiles    = d; merge(); }, true, onError);
    const unsubPremium = subscribeDownloads(true,  (d) => { premiumFiles = d; merge(); }, true, onError);

    return () => { unsubFree(); unsubPremium(); };
  }, []);

  const premiumFiles = files.filter((f) => f.isPremium);
  const freeFiles    = files.filter((f) => !f.isPremium);

  return (
    <div className="min-h-screen bg-dark bg-grid pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="badge-cyan mb-4">MY DOWNLOADS</div>
          <h1 className="section-title text-3xl md:text-4xl text-white mb-3">
            SECURE <span className="neon-text">FILES</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Your licensed downloads. Always up-to-date with the latest builds.
          </p>
        </motion.div>

        {/* Premium status */}
        {!isPremium || isExpired ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 glass-card p-5 border-yellow-400/20 bg-yellow-400/5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <HiShieldCheck className="text-yellow-400 shrink-0" size={24} />
            <div className="flex-1">
              <p className="font-orbitron text-xs font-bold text-yellow-400">
                {isExpired ? "LICENSE EXPIRED" : "FREE PLAN"}
              </p>
              <p className="text-white/50 text-sm mt-0.5">
                {isExpired
                  ? "Your license has expired. Renew to access premium downloads."
                  : "Upgrade to a premium plan to unlock all files."}
              </p>
            </div>
            <Link to="/portal/store" className="btn-cyber-filled py-2 px-5 text-xs shrink-0">
              {isExpired ? "RENEW" : "UPGRADE"}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 glass-card p-4 border-green-400/20 bg-green-400/5 flex items-center gap-3"
          >
            <HiShieldCheck className="text-green-400" size={20} />
            <p className="text-green-400 font-orbitron text-xs font-bold">PREMIUM ACCESS ACTIVE</p>
            <p className="text-white/40 text-xs ml-auto font-mono">All files unlocked</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-cyan/40 text-xs tracking-widest">LOADING FILES...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <HiDownload className="text-white/10 mx-auto mb-4" size={48} />
            <p className="text-white/30 font-rajdhani">No files available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {premiumFiles.length > 0 && (
              <section>
                <h2 className="font-orbitron text-xs text-white/30 tracking-widest mb-4 flex items-center gap-2">
                  <HiShieldCheck size={14} />
                  PREMIUM FILES
                </h2>
                <div className="space-y-3">
                  {premiumFiles.map((f, i) => (
                    <FileCard key={f.id} file={f} isPremium={isPremium && !isExpired} index={i} />
                  ))}
                </div>
              </section>
            )}

            {freeFiles.length > 0 && (
              <section>
                <h2 className="font-orbitron text-xs text-white/30 tracking-widest mb-4 flex items-center gap-2">
                  <HiDownload size={14} />
                  FREE FILES
                </h2>
                <div className="space-y-3">
                  {freeFiles.map((f, i) => (
                    <FileCard key={f.id} file={f} isPremium={true} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
