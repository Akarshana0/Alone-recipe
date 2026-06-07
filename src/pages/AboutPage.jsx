// Developer: AKARSHANA
// src/pages/AboutPage.jsx — Dynamic content from Firestore
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiShieldCheck, HiLightningBolt, HiCog, HiStar,
  HiSupport, HiGlobe, HiCode, HiCube,
} from "react-icons/hi";
import { subscribeSiteContent } from "../firebase/firestore";

const DEFAULT_ICONS = [HiCube, HiCode, HiShieldCheck, HiLightningBolt, HiCog, HiStar, HiGlobe, HiSupport];
const DEFAULT_SERVICES = [
  { title: "GAMING TOOLS",      desc: "Custom-built performance enhancement tools for competitive gaming, optimized for stability and speed." },
  { title: "SOFTWARE SUITE",    desc: "Professional utility software for system optimization, automation, and productivity." },
  { title: "SECURE PORTAL",     desc: "Client portal with Firebase authentication, real-time license management, and encrypted downloads." },
  { title: "INSTANT DELIVERY",  desc: "License activated within hours of payment confirmation via WhatsApp — no waiting queues." },
  { title: "AUTO UPDATES",      desc: "Automatic software updates pushed to your portal. Always have the latest version." },
  { title: "PREMIUM SUPPORT",   desc: "Dedicated WhatsApp support with fast response times for all premium clients." },
  { title: "CLOUD SYNC",        desc: "Firebase-powered real-time sync ensures your downloads and licenses are always current." },
  { title: "DEVICE MANAGEMENT", desc: "Manage your active devices and monitor usage directly from your client dashboard." },
];

export default function AboutPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const u = subscribeSiteContent("about", (data) => setContent(data));
    return () => u();
  }, []);

  const c        = content || {};
  const services = (c.services && c.services.length > 0) ? c.services : DEFAULT_SERVICES;

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="badge-cyan mb-4">ABOUT US</div>
          <h1 className="section-title text-3xl md:text-5xl text-white mb-4">
            {c.pageTitle ? (
              c.pageTitle.includes("SERVICES") ? <>OUR <span className="neon-text">SERVICES</span></> : c.pageTitle
            ) : <>OUR <span className="neon-text">SERVICES</span></>}
          </h1>
          <p className="text-white/40 max-w-xl mx-auto">
            {c.pageDesc || "Samura Xiter delivers premium gaming tools and software solutions through a secure, modern client portal built for performance and reliability."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(({ title, desc }, i) => {
            const Icon = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }} viewport={{ once: true }}
                className="glass-card p-6 group">
                <div className="w-12 h-12 border border-cyan/20 rounded-xl flex items-center justify-center text-cyan/60 mb-4 group-hover:text-cyan group-hover:border-cyan/50 group-hover:shadow-neon-sm transition-all duration-300">
                  <Icon size={22} />
                </div>
                <h3 className="font-orbitron text-xs font-bold text-white mb-2 tracking-wider">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mission statement */}
        {(c.quote || c.quoteAuthor) && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-16 glass-card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-px h-12 bg-gradient-to-b from-transparent to-cyan mx-auto mb-6" />
              <blockquote className="font-orbitron text-xl md:text-2xl font-bold text-white leading-relaxed mb-4">
                {c.quote || '"Built for operators who demand precision and reliability."'}
              </blockquote>
              <p className="text-white/40 font-mono text-sm">{c.quoteAuthor || "— Samura Xiter Team"}</p>
            </div>
          </motion.div>
        )}
        {!c.quote && !c.quoteAuthor && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-16 glass-card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-px h-12 bg-gradient-to-b from-transparent to-cyan mx-auto mb-6" />
              <blockquote className="font-orbitron text-xl md:text-2xl font-bold text-white leading-relaxed mb-4">
                "Built for operators who demand{" "}
                <span className="neon-text">precision</span> and{" "}
                <span className="neon-text">reliability</span>."
              </blockquote>
              <p className="text-white/40 font-mono text-sm">— Samura Xiter Team</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
