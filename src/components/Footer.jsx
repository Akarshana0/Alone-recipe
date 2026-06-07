// Developer: AKARSHANA
// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { SiWhatsapp, SiYoutube } from "react-icons/si";
import { HiMail } from "react-icons/hi";

const WA_NUM = import.meta.env.VITE_WHATSAPP_NUMBER || "94XXXXXXXXX";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="font-orbitron text-lg mb-3">
              <span className="brand-samura">SAMURA </span>
              <span className="brand-xiter">XITER</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              Premium gaming tools &amp; software portal. Secure, fast, and always updated.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="font-orbitron text-xs text-white/50 tracking-widest mb-4">NAVIGATION</div>
            <div className="flex flex-col gap-2">
              {[
                { to: "/",          label: "Home" },
                { to: "/about",     label: "About" },
                { to: "/contact",   label: "Contact" },
                { to: "/downloads", label: "Free Downloads" },
                { to: "/auth",      label: "Client Portal" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-white/40 hover:text-cyan transition-colors font-rajdhani"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <div className="font-orbitron text-xs text-white/50 tracking-widest mb-4">CONNECT</div>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 border border-green-500/20 rounded-lg flex items-center justify-center
                            text-green-400/60 hover:text-green-400 hover:border-green-400/40 transition-all">
                <SiWhatsapp size={18} />
              </a>
              <a href="https://www.youtube.com/@SamuraXit777" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 border border-red-500/20 rounded-lg flex items-center justify-center
                            text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-all">
                <SiYoutube size={18} />
              </a>
              <a href="mailto:support@samuraxiter.lk"
                 className="w-10 h-10 border border-cyan/20 rounded-lg flex items-center justify-center
                            text-cyan/60 hover:text-cyan hover:border-cyan/40 transition-all">
                <HiMail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="neon-divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20 font-mono">
          <span>© {new Date().getFullYear()} SAMURA XITER. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}
