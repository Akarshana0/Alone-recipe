// Developer: AKARSHANA
// src/pages/HomePage.jsx
// FULL REWRITE — removed useScroll/useTransform from hero (caused invisible content bug).
// Hero content now uses CSS keyframe animations → always visible on load, PC + mobile.

import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiChevronDown, HiShieldCheck, HiLightningBolt, HiCog, HiStar } from "react-icons/hi";
import { subscribeSiteContent, subscribeAnnouncements } from "../firebase/firestore";

const DEFAULT_ICONS = [HiShieldCheck, HiLightningBolt, HiCog, HiStar];

const Particle = ({ style }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-cyan opacity-40"
    style={{ left: style.left, top: style.top }}
    animate={{ y: [0, -60, 0], opacity: [0.2, 0.8, 0.2] }}
    transition={{ duration: style.duration, repeat: Infinity, delay: style.delay, ease: "easeInOut" }}
  />
);

const AnnouncementBanner = ({ item }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const colors = {
    info:    { bg: "bg-cyan/10",       border: "border-cyan/30",       text: "text-cyan"       },
    warning: { bg: "bg-yellow-400/10", border: "border-yellow-400/30", text: "text-yellow-400" },
    success: { bg: "bg-green-400/10",  border: "border-green-400/30",  text: "text-green-400"  },
    danger:  { bg: "bg-red-400/10",    border: "border-red-400/30",    text: "text-red-400"    },
  };
  const col = colors[item.type] || colors.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${col.bg} border ${col.border} rounded-xl px-4 py-3 flex items-start justify-between gap-3 mb-3`}
    >
      <div className="flex-1 min-w-0">
        <span className={`font-orbitron text-xs font-bold ${col.text} mr-2`}>{item.title}</span>
        <span className="text-white/60 text-xs font-rajdhani">{item.message}</span>
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer"
            className={`ml-2 text-xs underline ${col.text}`}>
            {item.linkLabel || "Read more"}
          </a>
        )}
      </div>
      <button onClick={() => setVisible(false)} className="text-white/30 hover:text-white shrink-0 mt-0.5">x</button>
    </motion.div>
  );
};

// Default content — hero renders immediately with these values.
// When Firestore loads, values update via state (no flash/blank screen).
const HOME_DEFAULTS = {
  heroTitle:    "SAMURA",
  heroSubtitle: "XITER",
  heroTagline:  "Premium Gaming & Software Portal",
  heroBadge:    "v2.5 ONLINE",
  ctaText:      "ENTER CLIENT AREA",
  stat1Val: "500+",  stat1Label: "ACTIVE CLIENTS",
  stat2Val: "99.9%", stat2Label: "UPTIME",
  stat3Val: "24/7",  stat3Label: "SUPPORT",
  feature1Title: "SECURE PLATFORM", feature1Desc: "Military-grade encryption protecting every session.",
  feature2Title: "INSTANT ACCESS",  feature2Desc: "License activated after payment confirmation via WhatsApp.",
  feature3Title: "AUTO UPDATES",    feature3Desc: "Premium updates pushed to your portal automatically.",
  feature4Title: "PREMIUM SUPPORT", feature4Desc: "WhatsApp support line with 24h response guarantee.",
  sectionBadge: "CAPABILITIES",
  sectionTitle: "WHY CHOOSE XITER",
  sectionDesc:  "Professional gaming tools delivered through a secure, modern client portal.",
  ctaBannerTitle: "READY TO LEVEL UP?",
  ctaBannerDesc:  "Join hundreds of clients with access to premium tools, instant updates, and priority support.",
};

export default function HomePage() {
  // Start with defaults so hero is IMMEDIATELY visible — Firestore updates merge in
  const [content, setContent] = useState(HOME_DEFAULTS);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const u1 = subscribeSiteContent("home", (data) => {
      if (data) setContent({ ...HOME_DEFAULTS, ...data });
    });
    const u2 = subscribeAnnouncements(setAnnouncements);
    return () => { u1(); u2(); };
  }, []);

  // content always has defaults so no fallback needed, but kept for safety
  const c = content;
  const heroTitle    = c.heroTitle;
  const heroSubtitle = c.heroSubtitle;
  const heroTagline  = c.heroTagline;
  const heroBadge    = c.heroBadge;
  const ctaText      = c.ctaText;

  const stats = [
    { val: c.stat1Val, label: c.stat1Label },
    { val: c.stat2Val, label: c.stat2Label },
    { val: c.stat3Val, label: c.stat3Label },
  ];

  const features = [1, 2, 3, 4].map((n, i) => ({
    icon: DEFAULT_ICONS[i],
    title: c["feature" + n + "Title"],
    desc:  c["feature" + n + "Desc"],
  }));

  const particles = useMemo(() => Array.from({ length: 20 }, () => ({
    left:     Math.random() * 100 + "%",
    top:      Math.random() * 100 + "%",
    duration: 4 + Math.random() * 4,
    delay:    Math.random() * 4,
  })), []);

  return (
    <div className="bg-dark">
      {announcements.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4 max-w-3xl mx-auto pt-2 space-y-2">
          {announcements.map(a => <AnnouncementBanner key={a.id} item={a} />)}
        </div>
      )}

      {/* HERO - fixed: no scroll-based opacity, CSS keyframes guarantee visibility */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,255,0.15) 0%, transparent 60%)" }}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className="absolute left-0 right-0 h-px bg-cyan/5" style={{ top: (i+1)*12.5 + "%" }} />
          ))}
        </div>

        {particles.map((p, i) => <Particle key={i} style={p} />)}

        <div className="absolute top-24 left-4 sm:left-8 w-12 sm:w-16 h-12 sm:h-16 border-t border-l border-cyan/30" />
        <div className="absolute top-24 right-4 sm:right-8 w-12 sm:w-16 h-12 sm:h-16 border-t border-r border-cyan/30" />
        <div className="absolute bottom-16 left-4 sm:left-8 w-12 sm:w-16 h-12 sm:h-16 border-b border-l border-cyan/30" />
        <div className="absolute bottom-16 right-4 sm:right-8 w-12 sm:w-16 h-12 sm:h-16 border-b border-r border-cyan/30" />

        {/* Hero content - CSS animations, always starts visible */}
        <div className="hero-content relative z-10 text-center px-4 w-full max-w-4xl mx-auto">

          <div className="hero-item-1 inline-flex items-center gap-2 mb-6 sm:mb-8">
            <span className="badge-cyan">{heroBadge}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/80 font-mono text-xs">ALL SYSTEMS OPERATIONAL</span>
          </div>

          <h1 className="hero-item-2 font-orbitron text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-4">
            <span className="brand-samura">{heroTitle}</span>
            <br />
            <span className="brand-xiter neon-text">{heroSubtitle}</span>
          </h1>

          <p className="hero-item-3 text-white/50 text-base sm:text-lg md:text-xl font-rajdhani tracking-widest mb-3 uppercase px-2">
            {heroTagline}
          </p>

          <div className="hero-item-4 w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-cyan to-transparent mx-auto mb-8 sm:mb-10" />

          <div className="hero-item-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <Link to="/auth" className="btn-cyber-filled text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              {ctaText}
            </Link>
            <Link to="/store" className="btn-cyber-filled text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center"
              style={{ background: "linear-gradient(135deg,rgba(0,200,100,0.15),rgba(0,200,100,0.05))", borderColor: "rgba(0,200,100,0.5)", color: "#00c864" }}>
              VIEW STORE
            </Link>
            <Link to="/about" className="btn-cyber text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              <span>LEARN MORE</span>
            </Link>
          </div>

          <div className="hero-item-6 flex items-center justify-center gap-6 sm:gap-10 mt-12 sm:mt-16 text-center">
            {stats.map(({ val, label }) => (
              <div key={label}>
                <div className="font-orbitron text-xl sm:text-2xl font-bold text-cyan">{val}</div>
                <div className="font-mono text-xs text-white/30 tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan/40">
          <HiChevronDown size={28} />
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16">
          <div className="badge-cyan mb-4">{c.sectionBadge || "CAPABILITIES"}</div>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-white mb-4">
            {c.sectionTitle
              ? (c.sectionTitle.includes("XITER")
                  ? <>{c.sectionTitle.replace("XITER","")}<span className="neon-text">XITER</span></>
                  : c.sectionTitle)
              : <>WHY CHOOSE <span className="neon-text">XITER</span></>}
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-sm sm:text-base">
            {c.sectionDesc || "Professional gaming tools delivered through a secure, modern client portal."}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}
              className="glass-card p-5 sm:p-6 group cursor-default">
              <div className="w-11 h-11 sm:w-12 sm:h-12 border border-cyan/30 rounded-lg flex items-center justify-center text-cyan mb-4 group-hover:border-cyan group-hover:shadow-neon-sm transition-all">
                <f.icon size={20} />
              </div>
              <h3 className="font-orbitron text-xs sm:text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 sm:py-20 px-4 pb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto glass-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="section-title text-xl sm:text-2xl md:text-3xl text-white mb-4">
              {c.ctaBannerTitle || <><span className="neon-text">READY TO</span> LEVEL UP?</>}
            </h2>
            <p className="text-white/50 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              {c.ctaBannerDesc || "Join hundreds of clients with access to premium tools, instant updates, and priority support."}
            </p>
            <Link to="/auth" className="btn-cyber-filled px-8 sm:px-10 py-3 sm:py-4 text-sm">GET STARTED NOW</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
