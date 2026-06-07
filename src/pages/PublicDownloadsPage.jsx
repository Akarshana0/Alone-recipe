// Developer: AKARSHANA
// src/pages/PublicDownloadsPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { subscribeDownloads } from "../firebase/firestore";
import { HiDownload, HiExternalLink, HiRefresh } from "react-icons/hi";

export default function PublicDownloadsPage() {
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeDownloads(
      false,
      (data) => { setFiles(data); setLoading(false); },
      true,
      (err) => { console.error("[PublicDownloads] Firestore error:", err); setFiles([]); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="badge-cyan mb-4">FREE TOOLS</div>
          <h1 className="section-title text-3xl md:text-4xl text-white mb-3">
            FREE <span className="neon-text">DOWNLOADS</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            Public tools available to everyone — no account required. Updated regularly.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-cyan/40 text-xs tracking-widest">LOADING FILES...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <HiDownload className="text-white/10 mx-auto mb-4" size={48} />
            <p className="text-white/30 font-rajdhani">No free tools available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 border border-cyan/20 rounded-xl flex items-center justify-center text-cyan/50 shrink-0">
                    <HiDownload size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-orbitron text-sm font-semibold text-white truncate">{f.name}</div>
                    {f.version && (
                      <span className="badge-cyan text-[10px] mr-2">{f.version}</span>
                    )}
                    {f.description && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">{f.description}</p>
                    )}
                  </div>
                </div>
                {/* BUG FIX: guard against empty/null url — was rendering a broken <a href=""> */}
                {f.url ? (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cyber text-xs py-2 px-4 shrink-0"
                  >
                    <span className="flex items-center gap-1.5">
                      <HiExternalLink size={13} /> DOWNLOAD
                    </span>
                  </a>
                ) : (
                  <span className="text-white/20 font-mono text-xs shrink-0">NO LINK</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-white/20 font-mono"
        >
          <HiRefresh size={12} />
          Files are synced in real-time from our database
        </motion.div>
      </div>
    </div>
  );
}
