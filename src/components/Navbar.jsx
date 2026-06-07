// Developer: AKARSHANA
// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/auth";
import {
  HiMenuAlt3, HiX, HiHome, HiInformationCircle,
  HiMail, HiDownload, HiLogout,
  HiViewGrid, HiShoppingBag, HiLockClosed,
  HiClipboardList, HiUserCircle, HiSupport,
} from "react-icons/hi";

const NAV_LINKS = [
  { to: "/",          label: "HOME",      icon: HiHome },
  { to: "/about",     label: "ABOUT",     icon: HiInformationCircle },
  { to: "/store",     label: "STORE",     icon: HiShoppingBag },
  { to: "/contact",   label: "CONTACT",   icon: HiMail },
  { to: "/downloads", label: "DOWNLOADS", icon: HiDownload },
];

const PORTAL_LINKS = [
  { to: "/portal",            label: "DASHBOARD", icon: HiViewGrid },
  { to: "/portal/store",      label: "STORE",     icon: HiShoppingBag },
  { to: "/portal/downloads",  label: "FILES",     icon: HiLockClosed },
  { to: "/portal/orders",     label: "ORDERS",    icon: HiClipboardList },
  { to: "/portal/support",    label: "SUPPORT",   icon: HiSupport },
  { to: "/portal/profile",    label: "PROFILE",   icon: HiUserCircle },
];

export default function Navbar() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const { currentUser, userData, rzUser, setRzUser, isRegzAuthSession } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isPortal = location.pathname.startsWith("/portal");
  // Consider logged in if either Firebase user OR RegzAuth session exists
  const isLoggedIn = !!currentUser || !!rzUser;

  // Derived display info for any session type
  const displayName = userData?.displayName
    || currentUser?.displayName
    || currentUser?.email?.split("@")[0]
    || rzUser?.username
    || rzUser?.email
    || "User";
  const planLabel = userData?.plan || (isRegzAuthSession ? "rex south" : "free");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const handleLogout = async () => {
    try {
      // Always clear RegzAuth session data
      sessionStorage.removeItem("rz_user");
      sessionStorage.removeItem("rz_session");
      setRzUser(null);
      // Always clear Firebase session too (signOut is a no-op if not signed in)
      await logout(currentUser?.uid);
    } catch (err) {
      console.error("[Navbar] Logout error:", err);
    } finally {
      navigate("/");
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark/95 backdrop-blur-xl border-b border-cyan/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 border border-cyan/50 rotate-45 flex items-center justify-center
                              group-hover:border-cyan group-hover:shadow-neon-sm transition-all duration-300">
                <div className="w-3 h-3 bg-cyan -rotate-45 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-orbitron">
                <span className="brand-samura">SAMURA</span>
                <span className="brand-xiter ml-1">XITER</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {(isPortal && isLoggedIn ? PORTAL_LINKS : NAV_LINKS).map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/portal"}
                  className={({ isActive }) =>
                    `px-4 py-2 text-xs font-orbitron tracking-widest transition-all duration-200 ${
                      isActive
                        ? "text-cyan neon-text border-b border-cyan"
                        : "text-white/60 hover:text-cyan hover:border-b hover:border-cyan/50"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  {!isPortal && (
                    <Link to="/portal" className="btn-cyber py-2 px-5 text-xs">
                      <span>CLIENT AREA</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono text-cyan/80">{displayName}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest">{planLabel} plan</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-9 h-9 border border-white/20 rounded flex items-center justify-center
                                 text-white/50 hover:text-red-400 hover:border-red-400/50 transition-all"
                    >
                      <HiLogout size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/auth" className="btn-cyber-filled py-2 px-5 text-xs">
                  CLIENT AREA
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-cyan"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Scan Line */}
        {scrolled && (
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        )}
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1,  y: 0  }}
            exit={{   opacity: 0,   y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-dark/98 backdrop-blur-xl
                       border-b border-cyan/10 md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {(isPortal && isLoggedIn ? PORTAL_LINKS : NAV_LINKS).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/portal"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded text-sm font-rajdhani tracking-widest ${
                      isActive
                        ? "text-cyan bg-cyan/5 border-l-2 border-cyan"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

              <div className="neon-divider" />

              {isLoggedIn ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div>
                    <div className="text-sm text-cyan font-mono">{displayName}</div>
                    <div className="text-xs text-white/40">
                      {currentUser?.email || (rzUser ? "Rex South ID" : "")}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-400/50 text-red-400 text-xs font-orbitron tracking-widest
                               hover:bg-red-400/10 hover:border-red-400 transition-all rounded"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn-cyber-filled text-center py-3 mx-4">
                  CLIENT AREA LOGIN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
