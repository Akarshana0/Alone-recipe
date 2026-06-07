// Developer: AKARSHANA
// src/components/CyberButton.jsx
import { Link } from "react-router-dom";

/**
 * CyberButton — Reusable styled button component
 *
 * Props:
 *   variant   : "outline" | "solid"   (default: "outline")
 *   size      : "sm" | "md" | "lg"   (default: "md")
 *   to        : string               (renders as <Link> if provided)
 *   href      : string               (renders as <a> if provided)
 *   onClick   : function
 *   disabled  : boolean
 *   className : string
 *   children  : ReactNode
 */
export default function CyberButton({
  variant   = "outline",
  size      = "md",
  to,
  href,
  onClick,
  disabled  = false,
  className = "",
  children,
  ...rest
}) {
  const sizes = {
    sm: "py-2 px-4 text-[0.65rem]",
    md: "py-3 px-7 text-[0.7rem]",
    lg: "py-4 px-10 text-[0.75rem]",
  };

  const base = `
    inline-flex items-center justify-center gap-2
    font-orbitron font-semibold tracking-widest uppercase
    transition-all duration-300 cursor-pointer
    ${sizes[size]}
    ${disabled ? "opacity-50 pointer-events-none" : ""}
    ${className}
  `;

  const variants = {
    outline: `
      bg-transparent border border-cyan text-cyan
      [clip-path:polygon(10px_0%,100%_0%,calc(100%-10px)_100%,0%_100%)]
      hover:shadow-neon hover:[text-shadow:0_0_8px_rgba(0,255,255,0.8)]
    `,
    solid: `
      bg-cyan text-dark font-bold
      [clip-path:polygon(10px_0%,100%_0%,calc(100%-10px)_100%,0%_100%)]
      hover:shadow-neon-lg hover:brightness-110
    `,
  };

  const cls = `${base} ${variants[variant]}`;

  if (to)   return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
  return (
    <button onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}
