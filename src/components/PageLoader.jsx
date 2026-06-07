// src/components/PageLoader.jsx
// Developer: AKARSHANA
// Dynamic loading system — different cyberpunk loader every page navigation

import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   LOADER 1 — Katana Slash Draw
═══════════════════════════════════════════════════════════ */
function KatanaSlash() {
  return (
    <div className="ldr-wrap">
      <div style={{ position: "relative", width: 280, height: 90 }}>
        {/* Blade */}
        <div style={{
          position: "absolute", top: "50%", left: 0,
          width: "100%", height: 2, transform: "translateY(-50%)",
          background: "linear-gradient(90deg, transparent 0%, #00FFFF 40%, #fff 50%, #00FFFF 60%, transparent 100%)",
          animation: "katana 1.8s cubic-bezier(.25,.46,.45,.94) infinite",
          boxShadow: "0 0 12px #00FFFF, 0 0 30px rgba(0,255,255,.4)",
          transformOrigin: "left center",
        }} />
        {/* Guard */}
        <div style={{
          position: "absolute", top: "50%", left: "8%",
          width: 14, height: 28, transform: "translateY(-50%) skewY(-8deg)",
          background: "rgba(0,255,255,.12)", border: "1px solid rgba(0,255,255,.6)",
          animation: "katana 1.8s cubic-bezier(.25,.46,.45,.94) infinite",
        }} />
        {/* Trail particles */}
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            position: "absolute", top: `${35 + i * 5}%`,
            left: `${52 + i * 7}%`, width: `${18 + i * 8}px`, height: 1,
            background: `rgba(0,255,255,${.55 - i * .08})`,
            animation: `slash-trail 1.8s ease-out ${i * .04}s infinite`,
            transformOrigin: "left center",
          }} />
        ))}
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".35em" }}>INITIALIZING</p>
      <style>{`
        @keyframes katana {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          10%  { opacity: 1; }
          60%  { clip-path: inset(0 0% 0 0); }
          85%  { clip-path: inset(0 0% 0 0); opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 0; }
        }
        @keyframes slash-trail {
          0%, 30% { transform: scaleX(0); opacity: 0; }
          50%     { transform: scaleX(1); opacity: 1; }
          100%    { transform: scaleX(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 2 — Hex Grid Boot
═══════════════════════════════════════════════════════════ */
function HexGrid() {
  return (
    <div className="ldr-wrap">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 44px)", gap: 6 }}>
        {[...Array(19)].map((_, i) => (
          <div key={i} style={{
            width: 40, height: 46, position: "relative",
            clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            background: "rgba(0,255,255,.04)",
            animation: `hex-p 2s ease-in-out ${(i * 80) % 1400}ms infinite`,
          }}>
            <div style={{
              position: "absolute", inset: 1,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              background: "rgba(0,255,255,.05)", border: "1px solid rgba(0,255,255,.18)",
            }} />
          </div>
        ))}
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".4em" }}>SYSTEM BOOT</p>
      <style>{`
        @keyframes hex-p {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(4) drop-shadow(0 0 8px #00FFFF); background: rgba(0,255,255,.2); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 3 — Matrix Rain
═══════════════════════════════════════════════════════════ */
function MatrixRain() {
  const chars = "サムライ忍者武士刀侍剣SAMURAXITER0101CYBER";
  // Use fixed seeds so no hydration mismatch
  const grid = [
    [8,5,12,0,3,14,7,2],
    [1,10,4,11,6,9,13,0],
    [3,7,1,5,12,2,8,11],
    [14,0,9,3,7,6,1,10],
    [5,12,6,8,0,11,4,3],
    [2,9,11,7,4,13,0,6],
    [10,3,0,12,8,5,9,1],
  ];
  return (
    <div className="ldr-wrap">
      <div style={{ display: "flex", gap: 12, fontFamily: "monospace", fontSize: 13, height: 105, overflow: "hidden" }}>
        {[...Array(8)].map((_, col) => (
          <div key={col} style={{
            display: "flex", flexDirection: "column", gap: 3,
            animation: `mat-col 1.6s linear ${col * .2}s infinite`,
          }}>
            {[...Array(7)].map((_, row) => (
              <span key={row} style={{
                color: row === 0 ? "#fff" : row === 1 ? "#00FFFF" : `rgba(0,255,255,${.6 - row * .08})`,
                textShadow: row <= 1 ? "0 0 8px #00FFFF" : "none",
              }}>
                {chars[grid[row][col] % chars.length]}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".3em", fontFamily: "monospace" }}>DECRYPTING</p>
      <style>{`
        @keyframes mat-col {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 4 — Orbital Rings
═══════════════════════════════════════════════════════════ */
function OrbitalRings() {
  const rings = [
    { size: 44, dur: 1.2, color: "#00FFFF", thick: 2, rev: false },
    { size: 72, dur: 2.0, color: "rgba(0,255,255,.55)", thick: 1, rev: true },
    { size: 104, dur: 3.0, color: "rgba(0,255,255,.28)", thick: 1, rev: false },
  ];
  return (
    <div className="ldr-wrap">
      <div style={{ position: "relative", width: 114, height: 114 }}>
        {/* Core */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 12, height: 12, borderRadius: "50%",
          background: "#00FFFF", transform: "translate(-50%,-50%)",
          boxShadow: "0 0 16px #00FFFF, 0 0 32px rgba(0,255,255,.5)",
          animation: "core-p 1.4s ease-in-out infinite",
        }} />
        {rings.map(({ size, dur, color, thick, rev }, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: size, height: size, marginTop: -size / 2, marginLeft: -size / 2,
            borderRadius: "50%", border: `${thick}px solid transparent`,
            borderTopColor: color, borderRightColor: i === 1 ? color : "transparent",
            animation: `${rev ? "orb-rev" : "orb"} ${dur}s linear infinite`,
            boxShadow: `0 0 ${6 + i * 2}px ${color}`,
          }}>
            <div style={{
              position: "absolute", top: -3, left: "50%",
              width: 6, height: 6, borderRadius: "50%",
              background: color, boxShadow: `0 0 8px ${color}`,
            }} />
          </div>
        ))}
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".4em" }}>LOADING</p>
      <style>{`
        @keyframes orb     { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
        @keyframes orb-rev { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }
        @keyframes core-p  {
          0%, 100% { transform: translate(-50%,-50%) scale(1);   box-shadow: 0 0 16px #00FFFF, 0 0 32px rgba(0,255,255,.5); }
          50%      { transform: translate(-50%,-50%) scale(1.5); box-shadow: 0 0 24px #00FFFF, 0 0 48px rgba(0,255,255,.6); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 5 — Glitch Scan
═══════════════════════════════════════════════════════════ */
function GlitchScan() {
  return (
    <div className="ldr-wrap">
      <div style={{ position: "relative", width: 240, height: 80, overflow: "hidden" }}>
        {["SAMURAXITER", "SAMURAXITER", "SAMURAXITER"].map((txt, i) => (
          <div key={i} style={{
            position: "absolute",
            top: i === 0 ? 0 : i === 1 ? "40%" : "68%",
            left: 0, right: 0, textAlign: "center",
            fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: i === 0 ? 22 : 13,
            color: i === 0 ? "#00FFFF" : `rgba(0,255,255,${.28 - i * .08})`,
            letterSpacing: ".2em",
            textShadow: i === 0 ? "0 0 20px #00FFFF" : "none",
            animation: `glitch-${i} 2.4s step-end infinite`,
            clipPath: i === 1 ? "inset(0 0 60% 0)" : i === 2 ? "inset(40% 0 0 0)" : "none",
          }}>{txt}</div>
        ))}
        {/* Scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,255,255,.8), transparent)",
          animation: "scan-line 1.2s linear infinite",
          boxShadow: "0 0 12px rgba(0,255,255,.6)",
        }} />
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".5em" }}>SYNCING</p>
      <style>{`
        @keyframes scan-line { from { top: 0; } to { top: 100%; } }
        @keyframes glitch-0 {
          0%, 90%, 100% { transform: translateX(0) skewX(0); opacity: 1; }
          92% { transform: translateX(-4px) skewX(-2deg); opacity: .8; }
          94% { transform: translateX(4px) skewX(2deg); opacity: 1; }
          96% { transform: translateX(-2px); }
        }
        @keyframes glitch-1 {
          0%, 88%, 100% { transform: translateX(0); opacity: .3; }
          90% { transform: translateX(8px); opacity: .6; }
          95% { transform: translateX(-6px); opacity: .2; }
        }
        @keyframes glitch-2 {
          0%, 85%, 100% { transform: translateX(0); opacity: .2; }
          87% { transform: translateX(-10px); opacity: .5; }
          92% { transform: translateX(5px); opacity: .1; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 6 — Data Packet Transfer
═══════════════════════════════════════════════════════════ */
function DataPacket() {
  return (
    <div className="ldr-wrap">
      <div style={{ position: "relative", width: 260, height: 60 }}>
        {/* Track */}
        <div style={{
          position: "absolute", top: "50%", left: 20, right: 20,
          height: 1, background: "rgba(0,255,255,.15)", transform: "translateY(-50%)",
        }} />
        {/* Nodes */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%",
            left: `${(i / 4) * 85 + 7}%`, transform: "translate(-50%,-50%)",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "rgba(0,255,255,.08)", border: "1px solid rgba(0,255,255,.35)",
              animation: `node-a 2s ease-in-out ${i * .3}s infinite`,
            }} />
          </div>
        ))}
        {/* Packet diamond */}
        <div style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)",
          animation: "pkt-move 2s cubic-bezier(.4,0,.2,1) infinite",
        }}>
          <div style={{
            width: 14, height: 14, background: "#00FFFF",
            clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
            boxShadow: "0 0 12px #00FFFF, 0 0 24px rgba(0,255,255,.4)",
          }} />
        </div>
        {/* Trail */}
        <div style={{
          position: "absolute", top: "50%", height: 3,
          transform: "translateY(-50%)", borderRadius: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,255,255,.55))",
          animation: "trail-move 2s cubic-bezier(.4,0,.2,1) infinite",
        }} />
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".35em" }}>TRANSFERRING</p>
      <style>{`
        @keyframes pkt-move   { 0% { left: 7%; } 100% { left: 90%; } }
        @keyframes trail-move { 0% { left: 7%; width: 0; } 50% { left: 7%; width: 40%; } 100% { left: 7%; width: 83%; } }
        @keyframes node-a {
          0%, 100% { background: rgba(0,255,255,.08); border-color: rgba(0,255,255,.35); box-shadow: none; }
          50%      { background: rgba(0,255,255,.45); border-color: #00FFFF; box-shadow: 0 0 10px #00FFFF; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 7 — Code Helix
═══════════════════════════════════════════════════════════ */
function CodeHelix() {
  const ROWS = 10;
  return (
    <div className="ldr-wrap">
      <div style={{ position: "relative", height: 120, width: 100 }}>
        {[...Array(ROWS)].map((_, i) => {
          const t  = i / (ROWS - 1);
          const x1 = Math.sin(t * Math.PI * 2) * 36 + 50;
          const x2 = Math.sin(t * Math.PI * 2 + Math.PI) * 36 + 50;
          const sc = 0.6 + Math.abs(Math.sin(t * Math.PI)) * 0.4;
          return (
            <div key={i} style={{ position: "absolute", top: `${t * 100}%`, left: 0, right: 0 }}>
              <div style={{
                position: "absolute", left: `${x1}%`, top: 0,
                width: 8 * sc, height: 8 * sc, borderRadius: "50%", background: "#00FFFF",
                transform: "translate(-50%,-50%)", boxShadow: `0 0 ${8 * sc}px #00FFFF`,
                animation: `hx 2s linear ${i * -.2}s infinite`,
              }} />
              {i % 2 === 0 && (
                <div style={{
                  position: "absolute", left: `${Math.min(x1, x2)}%`, top: 0,
                  height: 1, width: `${Math.abs(x2 - x1)}%`,
                  background: `rgba(0,255,255,${.2 + sc * .3})`, transform: "translateY(-50%)",
                }} />
              )}
              <div style={{
                position: "absolute", left: `${x2}%`, top: 0,
                width: 8 * sc, height: 8 * sc, borderRadius: "50%",
                background: "rgba(0,255,255,.45)", transform: "translate(-50%,-50%)",
                boxShadow: `0 0 ${4 * sc}px rgba(0,255,255,.5)`,
                animation: `hx 2s linear reverse ${i * -.2}s infinite`,
              }} />
            </div>
          );
        })}
      </div>
      <p className="ldr-label" style={{ letterSpacing: ".4em" }}>COMPILING</p>
      <style>{`
        @keyframes hx { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADER 8 — Terminal Boot Sequence
═══════════════════════════════════════════════════════════ */
function TerminalBoot() {
  const [lines, setLines] = useState([]);
  const BOOT = [
    "> SAMURAXITER OS v3.7.2",
    "> Verifying kernel integrity... OK",
    "> Loading combat modules...",
    "> Mounting encrypted volumes... OK",
    "> Auth subsystem online",
    "> All systems go.",
  ];
  useEffect(() => {
    let idx = 0;
    const iv = setInterval(() => {
      if (idx < BOOT.length) { setLines(p => [...p, BOOT[idx]]); idx++; }
      else { setLines([]); idx = 0; }
    }, 290);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="ldr-wrap">
      <div style={{
        width: 280, minHeight: 130, padding: "12px 16px",
        background: "rgba(0,0,0,.55)", border: "1px solid rgba(0,255,255,.18)",
        borderRadius: 6, fontFamily: "monospace", fontSize: 11,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            color: i === lines.length - 1 ? "#00FFFF" : "rgba(0,255,255,.5)",
            marginBottom: 4, animation: "ln-in .1s ease-out",
          }}>{line}</div>
        ))}
        <span style={{
          display: "inline-block", width: 8, height: 14,
          background: "#00FFFF", verticalAlign: "middle",
          animation: "term-blink .7s step-end infinite",
        }} />
      </div>
      <style>{`
        @keyframes ln-in      { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; } }
        @keyframes term-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Registry & rotation logic
═══════════════════════════════════════════════════════════ */
const VARIANTS = [
  KatanaSlash,
  HexGrid,
  MatrixRain,
  OrbitalRings,
  GlitchScan,
  DataPacket,
  CodeHelix,
  TerminalBoot,
];

// Module-level counter — increments each time PageLoader mounts,
// so every navigation shows the next variant in sequence.
let _variantCursor = Math.floor(Math.random() * VARIANTS.length);

/* ═══════════════════════════════════════════════════════════
   Main export
═══════════════════════════════════════════════════════════ */
export default function PageLoader() {
  const [Loader] = useState(() => {
    const V = VARIANTS[_variantCursor % VARIANTS.length];
    _variantCursor++;
    return V;
  });

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center relative overflow-hidden">

      {/* Subtle cyber grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: .025,
        backgroundImage:
          "linear-gradient(rgba(0,255,255,1) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(0,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Corner brackets */}
      {["tl","tr","bl","br"].map(pos => (
        <div key={pos} style={{
          position: "absolute",
          ...(pos.includes("t") ? { top: 24 } : { bottom: 24 }),
          ...(pos.includes("l") ? { left: 24 } : { right: 24 }),
          width: 26, height: 26,
          borderTop:    pos.includes("t") ? "1px solid rgba(0,255,255,.25)" : "none",
          borderBottom: pos.includes("b") ? "1px solid rgba(0,255,255,.25)" : "none",
          borderLeft:   pos.includes("l") ? "1px solid rgba(0,255,255,.25)" : "none",
          borderRight:  pos.includes("r") ? "1px solid rgba(0,255,255,.25)" : "none",
        }} />
      ))}

      {/* Active loader — fade in on mount */}
      <div style={{ animation: "ldr-in .3s ease-out" }}>
        <Loader />
      </div>

      {/* Base shared styles */}
      <style>{`
        .ldr-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .ldr-label {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          color: rgba(0,255,255,.4);
          letter-spacing: .4em;
          text-transform: uppercase;
          margin: 0;
          animation: ldr-pulse 2s ease-in-out infinite;
        }
        @keyframes ldr-in    { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes ldr-pulse { 0%, 100% { opacity: .4; } 50% { opacity: .85; } }
      `}</style>
    </div>
  );
}
