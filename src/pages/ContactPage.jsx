// Developer: AKARSHANA
// src/pages/ContactPage.jsx — Dynamic content from Firestore
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { SiWhatsapp, SiYoutube, SiDiscord } from "react-icons/si";
import { HiMail, HiCheck, HiExclamation, HiPaperAirplane, HiExternalLink } from "react-icons/hi";
import { subscribeSiteContent } from "../firebase/firestore";

const ICON_MAP = { youtube: SiYoutube, whatsapp: SiWhatsapp, discord: SiDiscord };

const DEFAULT_LINKS = [
  { icon: "youtube",  label: "YouTube",        sublabel: "@SamuraXit777",   href: "https://www.youtube.com/@SamuraXit777",    color: "#FF0000", desc: "Watch tutorials & showcases",     pulse: false },
  { icon: "whatsapp", label: "WhatsApp",        sublabel: "Live Support",    href: "https://wa.link/gqjni1",                   color: "#25D366", desc: "Fastest reply – click to chat",   pulse: true  },
  { icon: "discord",  label: "Discord DM",      sublabel: "@samuraxiter",    href: "https://discord.com/users/1496125348121939968",        color: "#5865F2", desc: "Send a direct message",           pulse: false },
  { icon: "discord",  label: "Discord Server",  sublabel: "Join Community",  href: "https://discord.gg/eqsThHbRMU",           color: "#5865F2", desc: "Join the Samura Xiter server",    pulse: false },
];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus]   = useState("idle");
  const formRef = useRef(null);

  useEffect(() => {
    const u = subscribeSiteContent("contact", (data) => setContent(data));
    return () => u();
  }, []);

  const c = content || {};
  const links = (c.socialLinks && c.socialLinks.length > 0) ? c.socialLinks : DEFAULT_LINKS;
  const showForm = c.formEnabled !== false;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-24 pb-20 px-4 bg-grid">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="badge-cyan mb-4">CONNECT WITH US</div>
          <h1 className="section-title text-3xl md:text-5xl text-white mb-4">
            {c.pageTitle || "CONTACT SAMURA"}
          </h1>
          <p className="text-white/40 max-w-md mx-auto font-rajdhani text-lg">
            {c.pageDesc || "Pick your preferred platform — we're always online."}
          </p>
        </motion.div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {links.map((link, i) => {
            const color      = link.color || "#00ffff";
            const glowColor  = hexToRgba(color, 0.25);
            const borderColor = hexToRgba(color, 0.25);
            const hoverBorder = hexToRgba(color, 0.55);
            const bgColor     = hexToRgba(color, 0.08);
            const iconKey = (link.icon || "").toLowerCase();
            const Icon = ICON_MAP[iconKey] || HiMail;

            return (
              <motion.a key={link.href || link.label || i} href={link.href} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="group relative glass-card p-6 flex items-center gap-5 cursor-pointer overflow-hidden transition-all duration-300"
                style={{ borderColor }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = hoverBorder; e.currentTarget.style.boxShadow = `0 0 28px ${glowColor}, 0 4px 24px rgba(0,0,0,0.5)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.boxShadow = ""; }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                  <Icon size={28} style={{ color }} />
                  {link.pulse && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-orbitron text-sm font-bold text-white">{link.label}</span>
                    {link.pulse && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color, background: bgColor, border: `1px solid ${borderColor}` }}>ONLINE</span>
                    )}
                  </div>
                  <div className="text-xs font-mono mb-1.5 truncate" style={{ color }}>{link.sublabel}</div>
                  <p className="text-xs text-white/40 font-rajdhani">{link.desc}</p>
                </div>
                <HiExternalLink size={16} className="flex-shrink-0 transition-all duration-300 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color }} />
              </motion.a>
            );
          })}
        </div>

        {/* Contact Form */}
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="mb-12">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.3))" }} />
                <span className="badge-cyan text-xs">OR SEND A MESSAGE</span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,255,255,0.3), transparent)" }} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.5 }}
              className="glass-card p-8 relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
              <div className="flex items-center gap-3 mb-7">
                <HiMail className="text-cyan/70" size={18} />
                <h2 className="font-orbitron text-sm font-bold text-white tracking-widest">SEND A MESSAGE</h2>
              </div>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-white/30 block mb-1.5 tracking-widest">NAME</label>
                    <input name="from_name" type="text" placeholder="Your name" value={form.name} onChange={update("name")} required className="cyber-input text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/30 block mb-1.5 tracking-widest">EMAIL</label>
                    <input name="from_email" type="email" placeholder="your@email.com" value={form.email} onChange={update("email")} required className="cyber-input text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-white/30 block mb-1.5 tracking-widest">SUBJECT</label>
                  <input name="subject" type="text" placeholder="How can we help?" value={form.subject} onChange={update("subject")} required className="cyber-input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/30 block mb-1.5 tracking-widest">MESSAGE</label>
                  <textarea name="message" placeholder="Describe your issue or question..." value={form.message} onChange={update("message")} required rows={5} className="cyber-input text-sm resize-none" />
                </div>
                {status === "success" && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                    <HiCheck className="text-green-400 flex-shrink-0" size={16} />
                    <span className="text-green-400 text-sm font-rajdhani">Message sent successfully!</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <HiExclamation className="text-red-400 flex-shrink-0" size={16} />
                    <span className="text-red-400 text-sm font-rajdhani">Failed to send. Try WhatsApp or Discord instead.</span>
                  </div>
                )}
                <button type="submit" disabled={status === "sending"}
                  className="w-full btn-cyber-filled py-3.5 justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ clipPath: "none", borderRadius: "8px" }}>
                  {status === "sending"
                    ? <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    : <><HiPaperAirplane size={15} className="-rotate-45" /> SEND MESSAGE</>}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
