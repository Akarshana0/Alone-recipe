// Developer: AKARSHANA
// src/components/NeonDivider.jsx
/**
 * NeonDivider — Horizontal neon gradient line
 *
 * Props:
 *   className : string — extra Tailwind classes
 *   color     : "cyan" | "green" | "red"  (default: "cyan")
 */
export default function NeonDivider({ className = "", color = "cyan" }) {
  const gradients = {
    cyan:  "from-transparent via-cyan to-transparent",
    green: "from-transparent via-green-400 to-transparent",
    red:   "from-transparent via-red-400 to-transparent",
  };
  return (
    <div
      className={`h-px w-full bg-gradient-to-r ${gradients[color]} opacity-35 my-5 ${className}`}
    />
  );
}
