// Developer: AKARSHANA
// src/pages/AuthPage.jsx — Dual Login: Firebase Auth + RegzAuth username/password
// Email + RegzAuth dual login

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { registerWithEmail, loginWithEmail } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  HiEye, HiEyeOff, HiUser, HiMail, HiLockClosed,
  HiExclamation, HiArrowLeft, HiFingerPrint, HiShieldCheck,
} from "react-icons/hi";

// ── RegzAuth Web Client API ─────────────────────────────────────────────────
// Uses the new /api/webclient/* REST endpoints (JSON, no init step required).
import { REGZAUTH_NAME, REGZAUTH_OWNERID, REGZAUTH_WEBCLIENT_URL } from "../firebase/regzAuthConfig";

// ── Low-level helpers ────────────────────────────────────────────────────────

async function _rzPost(endpoint, body) {
  const res = await fetch(`${REGZAUTH_WEBCLIENT_URL}/${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name: REGZAUTH_NAME, ownerid: REGZAUTH_OWNERID, ...body }),
  });
  if (!res.ok) throw new Error(`RegzAuth HTTP ${res.status}`);
  return res.json();
}

// Login — returns { success, message, sessionid, username, subscription, expires, info }
async function rzLogin(username, password) {
  return _rzPost("login", { username, password });
}

// Register — returns { success, message, info }
async function rzRegister(username, password, email = "", key = "") {
  const body = { username, password };
  if (email) body.email = email;
  if (key)   body.key   = key;
  return _rzPost("register", body);
}
// ───────────────────────────────────────────────────────────────────────────

const AUTH_ERRORS = {
  "auth/email-already-in-use":   "This email is already registered.",
  "auth/user-not-found":         "No account found with this email.",
  "auth/wrong-password":         "Incorrect password. Try again.",
  "auth/invalid-credential":     "Invalid email or password. Try again.",
  "auth/invalid-email":          "Please enter a valid email address.",
  "auth/too-many-requests":      "Too many attempts. Please try later.",
  "auth/weak-password":          "Password must be at least 6 characters.",
  "auth/popup-closed-by-user":   "Sign-in popup was closed. Please try again.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/not-regz-verified":      "This email is not registered in REX SOUTH. Please log in via Rex South ID tab first.",
};

// Login tabs: "firebase" = email+password via Firebase Auth
//             "regzauth" = username+password via RegzAuth API
// (Tab state is managed with useState("firebase") below — this constant was unused)

export default function AuthPage() {
  const [tab,       setTab]       = useState("firebase"); // active login tab
  const [mode,      setMode]      = useState("login");    // "login" | "register" | "forgot" | "magic"
  const [form,      setForm]      = useState({ name: "", email: "", password: "", confirm: "", rzUser: "", rzPass: "", rzEmail: "", rzKey: "" });

  // Clear error and reset mode when switching login tabs
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError("");
    setMode("login");
  };
  const [showPwd,      setShowPwd]      = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [resetSent,    setResetSent]    = useState(false);
  const [magicSent,    setMagicSent]    = useState(false);
  const [magicLoading, setMagicLoading] = useState(false); // for magic link auto-signin on load

  const navigate = useNavigate();
  const { currentUser, rzUser: contextRzUser, setRzUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect already-logged-in users (Firebase OR RegzAuth session)
  useEffect(() => {
    if (!authLoading && (currentUser || contextRzUser)) navigate("/portal", { replace: true });
  }, [currentUser, contextRzUser, authLoading, navigate]);

  // ── Handle Magic Link callback (user clicked the email link) ─────────────
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    setMagicLoading(true);
    setTab("firebase");
    setMode("magic");

    const storedEmail = localStorage.getItem("samura_magic_email");
    if (!storedEmail) {
      // Email not in storage (e.g. different device) — ask user to enter it
      setMagicLoading(false);
      setMode("magic_confirm");
      return;
    }

    signInWithEmailLink(auth, storedEmail, window.location.href)
      .then(() => {
        localStorage.removeItem("samura_magic_email");
        navigate("/portal");
      })
      .catch((err) => {
        setError("Magic link sign-in failed. Please try again.");
        setMagicLoading(false);
        setMode("magic");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const clearErr = () => setError("");

  // ── Firebase Email/Password ─────────────────────────────────────────────
  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    clearErr();
    if (mode === "register" && form.password !== form.confirm)
      return setError("Passwords do not match.");
    if (mode === "register" && form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // Login: allow any Firebase Auth registered user directly.
      // Register: still requires Rex South verification.
      if (mode === "register") {
        const emailKey = form.email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
        const rzSnap = await getDoc(doc(db, "regzVerifiedEmails", emailKey));
        if (!rzSnap.exists()) {
          throw { code: "auth/not-regz-verified" };
        }
        await registerWithEmail(form.email, form.password, form.name);
      } else {
        // Login: attempt directly — Firebase Auth rejects unknown users
        await loginWithEmail(form.email, form.password);
      }
      navigate("/portal");
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── RegzAuth Username/Password ──────────────────────────────────────────
  const handleRegzAuthLogin = async (e) => {
    e.preventDefault();
    clearErr();
    if (!form.rzUser.trim() || !form.rzPass) return setError("Enter your username and password.");

    setLoading(true);
    try {
      // ── New Web Client API: POST /api/webclient/login ──────────────
      const result = await rzLogin(form.rzUser.trim(), form.rzPass);

      if (result.success) {
        // Build a unified user object from the webclient response.
        // Top-level fields (username, subscription, expires) take precedence;
        // any extra fields from info{} are merged in for backward compat.
        const userObj = {
          ...(result.info || {}),
          username:     result.username     || form.rzUser.trim(),
          subscription: result.subscription || result.info?.subscription || "",
          expires:      result.expires      || result.info?.expires      || null,
        };

        // ── Save verified email to Firestore ───────────────────────
        const email = userObj.email || result.info?.email;
        if (email) {
          try {
            const emailKey = email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
            await setDoc(doc(db, "regzVerifiedEmails", emailKey), {
              email:      email.toLowerCase(),
              username:   userObj.username,
              verifiedAt: serverTimestamp(),
            }, { merge: true });
          } catch (e) {
            console.warn("[RegzAuth] Could not save verified email:", e.message);
          }
        }

        // ── Store session in sessionStorage ───────────────────────
        sessionStorage.setItem("rz_user",    JSON.stringify(userObj));
        sessionStorage.setItem("rz_session", result.sessionid);

        // Update AuthContext state immediately so ProtectedRoute allows through
        setRzUser(userObj);
        toast(`Welcome back, ${userObj.username}!`, "success");
        navigate("/portal");
      } else {
        setError(result.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Could not connect to auth server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── RegzAuth Register ────────────────────────────────────────────────────
  const handleRegzAuthRegister = async (e) => {
    e.preventDefault();
    clearErr();
    if (!form.rzUser.trim() || !form.rzPass) return setError("Enter username and password.");
    if (!form.rzKey.trim()) return setError("Enter your license key.");

    setLoading(true);
    try {
      // POST /api/webclient/register
      const result = await rzRegister(
        form.rzUser.trim(),
        form.rzPass,
        form.rzEmail.trim() || "",
        form.rzKey.trim(),
      );

      if (result.success) {
        toast("Account created! You can now log in.", "success");
        // Switch to login mode after successful registration
        setMode("login");
        setForm((f) => ({ ...f, rzEmail: "", rzKey: "", rzPass: "" }));
        clearErr();
      } else {
        setError(result.message || "Registration failed. Check your details.");
      }
    } catch (err) {
      setError(err.message || "Could not connect to auth server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearErr();
    if (!form.email) return setError("Please enter your email address.");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
      toast("Reset email sent! Check your inbox.", "success");
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Magic Link (Email-only login for REX SOUTH verified emails) ──────────
  const handleMagicLink = async (e) => {
    e.preventDefault();
    clearErr();
    if (!form.email) return setError("Please enter your email address.");

    setLoading(true);
    try {
      // 1. Check email is REX SOUTH verified
      const emailKey = form.email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
      const rzSnap = await getDoc(doc(db, "regzVerifiedEmails", emailKey));
      if (!rzSnap.exists()) {
        throw new Error(
          "This email is not registered in REX SOUTH. " +
          "Please log in via the REX SOUTH ID tab first to link your account."
        );
      }

      // 2. Send the Firebase magic link
      const actionCodeSettings = {
        url: window.location.origin + "/auth",
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, form.email, actionCodeSettings);

      // 3. Save email to localStorage for when user comes back from link
      localStorage.setItem("samura_magic_email", form.email);
      setMagicSent(true);
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || err.message || "Failed to send link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Magic Link confirm (different-device flow) ────────────────────────────
  const handleMagicConfirm = async (e) => {
    e.preventDefault();
    clearErr();
    if (!form.email) return setError("Please enter your email address.");
    setLoading(true);
    try {
      await signInWithEmailLink(auth, form.email, window.location.href);
      localStorage.removeItem("samura_magic_email");
      navigate("/portal");
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || "Verification failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (magicLoading) return null;

  return (
    <div className="min-h-screen bg-dark bg-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[400px] bg-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/">
            <span className="font-orbitron text-2xl">
              <span className="brand-samura">SAMURA </span>
              <span className="brand-xiter">XITER</span>
            </span>
          </Link>
          <p className="text-white/30 text-sm mt-1 font-mono tracking-widest">CLIENT PORTAL ACCESS</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />

          {/* ── Forgot Password ── */}
          {mode === "forgot" ? (
            <div>
              <button
                onClick={() => { setMode("login"); clearErr(); setResetSent(false); }}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-cyan mb-6 font-orbitron tracking-widest transition-colors"
              >
                <HiArrowLeft size={14} /> BACK TO LOGIN
              </button>

              <h2 className="font-orbitron text-sm text-white mb-1">RESET PASSWORD</h2>
              <p className="text-xs text-white/40 mb-6">
                Enter your account email and we'll send a reset link.
              </p>

              {resetSent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">📧</div>
                  <div className="font-orbitron text-cyan text-sm mb-2">EMAIL SENT!</div>
                  <p className="text-xs text-white/40">Check your inbox for the password reset link.</p>
                  <button
                    onClick={() => { setMode("login"); setResetSent(false); clearErr(); }}
                    className="mt-6 text-xs font-orbitron text-cyan hover:underline tracking-widest"
                  >
                    BACK TO LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && <ErrorBanner message={error} />}
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="email" placeholder="Email address"
                      value={form.email} onChange={update("email")} required
                      className="cyber-input pl-10 text-sm"
                    />
                  </div>
                  <SubmitButton loading={loading} label="SEND RESET LINK" loadingLabel="SENDING..." />
                </form>
              )}
            </div>

          /* ── Magic Link — send flow ── */
          ) : mode === "magic" ? (
            <div>
              <button
                onClick={() => { setMode("login"); clearErr(); setMagicSent(false); }}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-cyan mb-6 font-orbitron tracking-widest transition-colors"
              >
                <HiArrowLeft size={14} /> BACK TO LOGIN
              </button>

              <h2 className="font-orbitron text-sm text-white mb-1">EMAIL MAGIC LINK</h2>
              <p className="text-xs text-white/40 mb-6 leading-relaxed">
                Only works if your email is registered in{" "}
                <span className="text-cyan/70">REX SOUTH</span>.
                We'll send a one-click sign-in link — no password needed.
              </p>

              {magicSent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">🔗</div>
                  <div className="font-orbitron text-cyan text-sm mb-2">LINK SENT!</div>
                  <p className="text-xs text-white/40 mb-1">
                    Check your inbox for the magic sign-in link.
                  </p>
                  <p className="text-xs text-white/25 font-mono">
                    {form.email}
                  </p>
                  <button
                    onClick={() => { setMode("login"); setMagicSent(false); clearErr(); }}
                    className="mt-6 text-xs font-orbitron text-cyan hover:underline tracking-widest"
                  >
                    BACK TO LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  {error && <ErrorBanner message={error} />}
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="email" placeholder="Your REX SOUTH email"
                      value={form.email} onChange={update("email")} required
                      className="cyber-input pl-10 text-sm"
                    />
                  </div>
                  <SubmitButton loading={loading} label="SEND MAGIC LINK" loadingLabel="SENDING..." />
                </form>
              )}
            </div>

          /* ── Magic Link — different-device confirm flow ── */
          ) : mode === "magic_confirm" ? (
            <div>
              <h2 className="font-orbitron text-sm text-white mb-1">CONFIRM YOUR EMAIL</h2>
              <p className="text-xs text-white/40 mb-6 leading-relaxed">
                You opened the magic link on a different device. Enter your email to complete sign-in.
              </p>
              {error && <ErrorBanner message={error} />}
              <form onSubmit={handleMagicConfirm} className="space-y-4">
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="email" placeholder="Your email address"
                    value={form.email} onChange={update("email")} required
                    className="cyber-input pl-10 text-sm"
                  />
                </div>
                <SubmitButton loading={loading} label="CONFIRM & SIGN IN" />
              </form>
            </div>

          ) : (
            <>
              {/* ── Login Method Tabs ── */}
              <div className="flex bg-black/40 rounded-lg p-1 mb-6 gap-1">
                <TabButton active={tab === "firebase"} onClick={() => { handleTabChange("firebase"); clearErr(); }}>
                  <HiMail size={13} /> EMAIL LOGIN
                </TabButton>
                <TabButton active={tab === "regzauth"} onClick={() => { handleTabChange("regzauth"); clearErr(); }}>
                  <HiFingerPrint size={13} /> REX SOUTH ID
                </TabButton>
              </div>

              {/* ── Firebase Tab (Email Login) ── */}
              {tab === "firebase" && (
                <>
                  {/* Sign-in / Register toggle */}
                  <div className="flex bg-black/40 rounded-lg p-1 mb-6">
                    {["login", "register"].map((m) => (
                      <button
                        key={m}
                        onClick={() => { setMode(m); clearErr(); setShowPwd(false); setForm({ ...form, name: "", email: "", password: "", confirm: "" }); }}
                        className={`flex-1 py-2.5 rounded-md text-xs font-orbitron tracking-widest transition-all duration-300 ${
                          mode === m
                            ? "bg-cyan text-dark font-bold shadow-neon-sm"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {m === "login" ? "SIGN IN" : "REGISTER"}
                      </button>
                    ))}
                  </div>

                  {/* Email form */}
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={mode}
                      initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleFirebaseSubmit}
                      className="space-y-4"
                    >
                      {mode === "register" && (
                        <div className="relative">
                          <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                          <input type="text" placeholder="Display Name"
                            value={form.name} onChange={update("name")} required
                            className="cyber-input pl-10"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                        <input type="email" placeholder="Email Address"
                          value={form.email} onChange={update("email")} required
                          className="cyber-input pl-10"
                        />
                      </div>
                      <PasswordField value={form.password} onChange={update("password")} show={showPwd} onToggle={() => setShowPwd(!showPwd)} />
                      {mode === "register" && (
                        <div className="relative">
                          <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                          <input type={showPwd ? "text" : "password"} placeholder="Confirm Password"
                            value={form.confirm} onChange={update("confirm")} required
                            className="cyber-input pl-10"
                          />
                        </div>
                      )}

                      {error && <ErrorBanner message={error} />}

                      <SubmitButton
                        loading={loading}
                        label={mode === "login" ? "ACCESS PORTAL" : "CREATE ACCOUNT"}
                      />
                    </motion.form>
                  </AnimatePresence>

                  {mode === "register" && (
                    <p className="text-white/25 text-xs text-center mt-4">
                      By registering you agree to our terms of service and privacy policy.
                    </p>
                  )}
                  {mode === "login" && (
                    <div className="text-center mt-4 space-y-2">
                      <button
                        onClick={() => { setMode("forgot"); clearErr(); }}
                        className="text-xs text-white/30 hover:text-cyan transition-colors font-mono tracking-widest block w-full"
                      >
                        FORGOT PASSWORD?
                      </button>
                      <button
                        onClick={() => { setMode("magic"); clearErr(); setMagicSent(false); }}
                        className="text-xs text-cyan/50 hover:text-cyan transition-colors font-mono tracking-widest block w-full"
                      >
                        ⚡ LOGIN WITH EMAIL ONLY (REX SOUTH)
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── RegzAuth Tab (Rex South username/password) ── */}
              {tab === "regzauth" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Login / Register toggle */}
                  <div className="flex bg-black/40 rounded-lg p-1 mb-5">
                    {["login", "register"].map((m) => (
                      <button
                        key={m}
                        onClick={() => { setMode(m); clearErr(); }}
                        className={`flex-1 py-2.5 rounded-md text-xs font-orbitron tracking-widest transition-all duration-300 ${
                          mode === m
                            ? "bg-cyan text-dark font-bold shadow-neon-sm"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {m === "login" ? "SIGN IN" : "REGISTER"}
                      </button>
                    ))}
                  </div>

                  {/* Info banner */}
                  <div className="flex items-start gap-3 p-3 mb-5 bg-cyan/5 border border-cyan/15 rounded-lg">
                    <HiFingerPrint className="text-cyan/60 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-white/40 leading-relaxed">
                      {mode === "login"
                        ? <>Sign in using your <span className="text-cyan/70">Rex South</span> username and password. This is the same account you use in our software loader.</>
                        : <>Create a <span className="text-cyan/70">Rex South</span> account using your license key. You'll use this to access the software loader.</>
                      }
                    </p>
                  </div>

                  {/* Login form */}
                  {mode === "login" && (
                    <form onSubmit={handleRegzAuthLogin} className="space-y-4">
                      <div className="relative">
                        <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                        <input
                          type="text" placeholder="Rex South Username"
                          value={form.rzUser} onChange={update("rzUser")} required
                          autoComplete="username"
                          className="cyber-input pl-10"
                        />
                      </div>
                      <PasswordField
                        value={form.rzPass}
                        onChange={update("rzPass")}
                        show={showPwd}
                        onToggle={() => setShowPwd(!showPwd)}
                        placeholder="Rex South Password"
                      />
                      {error && <ErrorBanner message={error} />}
                      <SubmitButton loading={loading} label="LOGIN WITH REX SOUTH ID" />
                    </form>
                  )}

                  {/* Register form */}
                  {mode === "register" && (
                    <form onSubmit={handleRegzAuthRegister} className="space-y-4">
                      <div className="relative">
                        <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                        <input
                          type="text" placeholder="Choose Username"
                          value={form.rzUser} onChange={update("rzUser")} required
                          autoComplete="username"
                          className="cyber-input pl-10"
                        />
                      </div>
                      <PasswordField
                        value={form.rzPass}
                        onChange={update("rzPass")}
                        show={showPwd}
                        onToggle={() => setShowPwd(!showPwd)}
                        placeholder="Choose Password"
                      />
                      <div className="relative">
                        <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                        <input
                          type="email" placeholder="Email (optional)"
                          value={form.rzEmail} onChange={update("rzEmail")}
                          autoComplete="email"
                          className="cyber-input pl-10"
                        />
                      </div>
                      <div className="relative">
                        <HiShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                        <input
                          type="text" placeholder="License Key"
                          value={form.rzKey} onChange={update("rzKey")} required
                          className="cyber-input pl-10 font-mono text-sm"
                        />
                      </div>
                      {error && <ErrorBanner message={error} />}
                      <SubmitButton loading={loading} label="CREATE REX SOUTH ACCOUNT" />
                      <p className="text-white/20 text-xs text-center font-mono">
                        By registering you agree to our terms of service and privacy policy.
                      </p>
                    </form>
                  )}

                  {mode === "login" && (
                    <p className="text-white/20 text-xs text-center mt-4 font-mono">
                      No account? <button onClick={() => { setMode("register"); clearErr(); }} className="text-cyan/50 hover:text-cyan transition-colors">Register here</button>
                    </p>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <Link to="/" className="text-white/30 text-sm hover:text-cyan transition-colors font-mono">
            ← BACK TO MAIN SITE
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Small shared components ────────────────────────────────────────────── */

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-orbitron tracking-widest transition-all duration-300 ${
        active ? "bg-cyan text-dark font-bold shadow-neon-sm" : "text-white/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function PasswordField({ value, onChange, show, onToggle, placeholder = "Password" }) {
  return (
    <div className="relative">
      <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete="current-password"
        className="cyber-input pl-10 pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <HiEyeOff size={16} /> : <HiEye size={16} />}
      </button>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"
      >
        <HiExclamation className="text-red-400 shrink-0" size={16} />
        <span className="text-red-400 text-sm">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full btn-cyber-filled py-3.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ clipPath: "none", borderRadius: "8px" }}
    >
      {loading ? (
        loadingLabel
          ? <span className="text-xs font-orbitron tracking-widest">{loadingLabel}</span>
          : <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}
