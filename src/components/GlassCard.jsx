// Developer: AKARSHANA
// src/components/GlassCard.jsx
import { motion } from "framer-motion";

/**
 * GlassCard — Reusable glassmorphism card with optional neon border
 *
 * Props:
 *   animate   : boolean  — fade-up animation on mount (default: true)
 *   delay     : number   — animation delay in seconds (default: 0)
 *   hover     : boolean  — glow on hover (default: true)
 *   padding   : string   — Tailwind padding class (default: "p-6")
 *   className : string
 *   children  : ReactNode
 *   onClick   : function
 */
export default function GlassCard({
  animate   = true,
  delay     = 0,
  hover     = true,
  padding   = "p-6",
  className = "",
  children,
  onClick,
}) {
  const base = (
    `relative overflow-hidden rounded-xl
     bg-[rgba(15,15,26,0.85)] backdrop-blur-xl
     border border-[rgba(0,255,255,0.12)]
     shadow-glass
     transition-all duration-300
     ${hover ? "hover:border-[rgba(0,255,255,0.3)] hover:shadow-neon" : ""}
     ${onClick ? "cursor-pointer" : ""}
     ${padding} ${className}`
  );

  const content = (
    <>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
      {children}
    </>
  );

  if (!animate) {
    return <div className={base} onClick={onClick}>{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={base}
      onClick={onClick}
    >
      {content}
    </motion.div>
  );
}
