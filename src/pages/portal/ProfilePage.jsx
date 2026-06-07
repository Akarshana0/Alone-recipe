// Developer: AKARSHANA
// src/pages/portal/ProfilePage.jsx — HWID reset: Firebase email/password + Rex South ID

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiUserCircle, HiShieldCheck, HiRefresh,
  HiLogout, HiMail, HiIdentification,
  HiClock, HiExclamationCircle,
  HiDesktopComputer, HiDeviceMobile,
  HiTrash, HiBan, HiStatusOnline,
  HiLockClosed, HiEye, HiEyeOff,
} from "react-icons/hi";
import { useAuth }     from "../../context/AuthContext";
import { useUserData } from "../../hooks/useUserData";
import { useToast }    from "../../context/ToastContext";
import { logout, getDeviceId } from "../../firebase/auth";
import {
  resetUserHWID,      getUserHWIDResetInfo,
  resetRegzUserHWID,  getRegzUserHWIDInfo,
  revokeDevice,       revokeAllOtherDevices,
} from "../../firebase/firestore";
import { useNavigate } from "react-router-dom";

// Daily reset limit — must match RZ_MAX_RESETS_PER_DAY in firestore.js
const MAX_RESETS_PER_DAY = 3;

// ─── Small helpers ──────────────────────────────────────────────────────────

function timeAgo(isoString) {
  if (!isoString) return "—";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function DeviceIcon({ os, isCurrent }) {
  const isMobile = /iphone|ipad|android/i.test(os);
  const Icon = isMobile ? HiDeviceMobile : HiDesktopComputer;
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
      isCurrent ? "bg-cyan/15 border border-cyan/40" : "bg-white/5 border border-white/10"
    }`}>
      <Icon className={isCurrent ? "text-cyan" : "text-white/40"} size={18} />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="text-cyan/50 shrink-0 mt-0.5" size={16} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-white/30 text-xs">{label}</p>
        <p className="text-white/80 text-sm font-rajdhani mt-0.5 break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Default HWID info objects ──────────────────────────────────────────────

const DEFAULT_HWID_FIREBASE = {
  hwid: null, resetCount: 0, lastResetAt: null,
  resetsToday: 0, maxResetsPerDay: MAX_RESETS_PER_DAY,
};

const DEFAULT_HWID_REGZ = {
  hwid: null, resetCount: 0, lastResetAt: null,
  resetsToday: 0, maxResetsPerDay: MAX_RESETS_PER_DAY,
  pendingAdminReset: false, isRegzAuth: true,
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { currentUser, userData, rzUser, setRzUser, isRegzAuthSession } = useAuth();
  const { daysRemaining, isExpired, loading } = useUserData();
  const { toast: showToast } = useToast();
  const navigate = useNavigate();

  const [hwidInfo,    setHwidInfo]    = useState(null);   // null = loading
  const [resetting,   setResetting]   = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const [revokingId,  setRevokingId]  = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [rzPassword,  setRzPassword]  = useState("");     // for webclient HWID reset
  const [showRzPwd,   setShowRzPwd]   = useState(false);  // toggle password visibility

  const uid             = currentUser?.uid || null;
  const rzUsername      = rzUser?.username  || null;
  const currentDeviceId = uid ? getDeviceId(uid) : null;

  // Display values
  const displayName = userData?.displayName
    || currentUser?.displayName
    || currentUser?.email?.split("@")[0]
    || rzUsername
    || "Xiter User";

  const email = userData?.email || currentUser?.email || rzUser?.email || "—";
  const plan  = userData?.plan  || (rzUser ? "rex south" : "free");

  // Sorted device list (Firebase users only)
  const devices      = (userData?.devices || []).slice().sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  const otherDevices = devices.filter((d) => d.id !== currentDeviceId);

  // ── Load HWID info ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (isRegzAuthSession) {
      // ── Rex South ID login ──────────────────────────────────────────
      if (!rzUsername) {
        setHwidInfo({ ...DEFAULT_HWID_REGZ });
        return;
      }
      getRegzUserHWIDInfo(rzUsername)
        .then((info) => { if (!cancelled) setHwidInfo({ ...info, isRegzAuth: true, hwid: null }); })
        .catch(()    => { if (!cancelled) setHwidInfo({ ...DEFAULT_HWID_REGZ }); });
    } else if (uid) {
      // ── Firebase email/password login ───────────────────────────────
      getUserHWIDResetInfo(uid)
        .then((info) => { if (!cancelled) setHwidInfo(info); })
        .catch(()    => { if (!cancelled) setHwidInfo({ ...DEFAULT_HWID_FIREBASE }); });
    } else {
      // No session (should not happen inside ProtectedRoute)
      setHwidInfo({ ...DEFAULT_HWID_FIREBASE });
    }

    return () => { cancelled = true; };
  }, [uid, isRegzAuthSession, rzUsername]);

  // ── HWID Reset handler — works for BOTH login types ─────────────────
  const handleHwidReset = async () => {
    setResetting(true);
    try {
      if (isRegzAuthSession) {
        // ── Rex South ID path ─────────────────────────────────────────
        if (!rzUsername) throw new Error("Session expired. Please log out and log in again.");

        // Pass the user's active login session so the API can use it.
        // resetRegzUserHWID will try: 1) webclient API with password, 2) user session, 3) owner session.
        const userSessionId = sessionStorage.getItem("rz_session") || null;
        await resetRegzUserHWID(rzUsername, userSessionId, rzPassword || null);

        // Refresh counters from Firestore
        const info = await getRegzUserHWIDInfo(rzUsername);
        setHwidInfo({ ...info, isRegzAuth: true, hwid: null });
        showToast("HWID reset successful. You can now log in on a new device.", "success");

      } else {
        // ── Firebase email/password path ──────────────────────────────
        if (!uid) throw new Error("Session expired. Please log out and log in again.");
        await resetUserHWID(uid);

        // Refresh counters from Firestore
        const info = await getUserHWIDResetInfo(uid);
        setHwidInfo(info);
        showToast("HWID reset successful. You can now log in on a new device.", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to reset HWID. Please try again.", "error");
    } finally {
      setResetting(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      sessionStorage.removeItem("rz_user");
      sessionStorage.removeItem("rz_session");
      setRzUser(null);
      if (uid) await logout(uid);
      navigate("/");
    } catch {
      showToast("Logout failed. Please try again.", "error");
      setLoggingOut(false);
    }
  };

  // ── Revoke single device ─────────────────────────────────────────────
  const handleRevokeDevice = useCallback(async (deviceId) => {
    if (!uid || deviceId === currentDeviceId) return;
    setRevokingId(deviceId);
    try {
      await revokeDevice(uid, deviceId);
      showToast("Device session revoked.", "success");
    } catch (err) {
      showToast(err.message || "Failed to revoke device.", "error");
    } finally {
      setRevokingId(null);
    }
  }, [uid, currentDeviceId, showToast]);

  // ── Revoke all other devices ─────────────────────────────────────────
  const handleRevokeAll = useCallback(async () => {
    if (!uid || !currentDeviceId) return;
    setRevokingAll(true);
    try {
      await revokeAllOtherDevices(uid, currentDeviceId);
      showToast("All other sessions have been terminated.", "success");
    } catch (err) {
      showToast(err.message || "Failed to revoke sessions.", "error");
    } finally {
      setRevokingAll(false);
    }
  }, [uid, currentDeviceId, showToast]);

  // Derived
  const resetsLeft   = hwidInfo != null ? hwidInfo.maxResetsPerDay - hwidInfo.resetsToday : null;
  const limitReached = resetsLeft !== null && resetsLeft <= 0;

  // ── Loading screen ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-cyan/50 text-xs tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark bg-grid pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="badge-cyan mb-4">ACCOUNT</div>
          <h1 className="section-title text-3xl md:text-4xl text-white mb-3">
            MY <span className="neon-text">PROFILE</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Account info card ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full border border-cyan/30 bg-cyan/5 flex items-center justify-center">
                <HiUserCircle className="text-cyan/60" size={28} />
              </div>
              <div>
                <p className="font-orbitron text-sm font-bold text-white">{displayName}</p>
                <p className="text-white/40 text-xs font-rajdhani mt-0.5">{email}</p>
              </div>
            </div>

            {/* Firebase user: show UID */}
            {uid && (
              <InfoRow icon={HiIdentification} label="USER ID"       value={`${uid.slice(0, 12)}...`} />
            )}
            {/* RegzAuth user: show username */}
            {isRegzAuthSession && rzUsername && (
              <InfoRow icon={HiIdentification} label="REX SOUTH ID"  value={rzUsername} />
            )}
            <InfoRow icon={HiMail}        label="EMAIL"         value={email} />
            <InfoRow icon={HiShieldCheck} label="PLAN"          value={plan.toUpperCase()} />
            {daysRemaining !== null && (
              <InfoRow
                icon={HiClock}
                label="DAYS REMAINING"
                value={isExpired ? "EXPIRED" : `${daysRemaining} days`}
              />
            )}
            {userData?.licenseExpiry && (
              <InfoRow
                icon={HiClock}
                label="EXPIRES"
                value={
                  userData.licenseExpiry.toDate
                    ? userData.licenseExpiry.toDate().toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })
                    : "—"
                }
              />
            )}
          </motion.div>

          {/* ── HWID card — shown to ALL logged-in users ─────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-orbitron text-xs font-bold text-white/60 tracking-widest">
                HWID MANAGEMENT
              </h3>
              {isRegzAuthSession ? (
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  REX SOUTH
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan/10 text-cyan border border-cyan/20">
                  FIREBASE
                </span>
              )}
            </div>

            {/* Loading state */}
            {hwidInfo === null ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
                <span className="font-mono text-white/30 text-xs">Loading HWID info...</span>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Current HWID — Firebase users only (RegzAuth doesn't expose it to frontend) */}
                {!isRegzAuthSession && (
                  <div className="stat-block">
                    <p className="font-mono text-white/30 text-xs mb-1">CURRENT HWID</p>
                    <p className="text-white/60 text-xs font-mono break-all">
                      {hwidInfo.hwid
                        ? hwidInfo.hwid
                        : <span className="text-green-400">Not set — all devices allowed</span>
                      }
                    </p>
                  </div>
                )}

                {/* Info note for RegzAuth users */}
                {isRegzAuthSession && (
                  <div className="stat-block border-purple-500/20 bg-purple-500/5">
                    <p className="text-purple-300/70 text-xs font-rajdhani leading-relaxed">
                      HWID is managed by Rex South. After resetting you can
                      log in from a new device immediately.
                    </p>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="stat-block text-center">
                    <p className={`font-orbitron font-bold text-xl ${
                      limitReached ? "text-red-400" : "text-cyan"
                    }`}>
                      {resetsLeft ?? "—"}
                    </p>
                    <p className="font-mono text-white/30 text-xs mt-1">RESETS LEFT TODAY</p>
                  </div>
                  <div className="stat-block text-center">
                    <p className="font-orbitron font-bold text-xl text-white/60">
                      {hwidInfo.resetCount}
                    </p>
                    <p className="font-mono text-white/30 text-xs mt-1">TOTAL RESETS</p>
                  </div>
                </div>

                {/* Last reset timestamp */}
                {hwidInfo.lastResetAt && (
                  <p className="text-white/25 font-mono text-xs">
                    Last reset: {hwidInfo.lastResetAt.toLocaleDateString()}
                  </p>
                )}

                {/* Action area */}
                {limitReached ? (
                  <div className="stat-block border-red-400/20">
                    <div className="flex items-center gap-2">
                      <HiExclamationCircle className="text-red-400 shrink-0" size={14} />
                      <p className="text-red-400/70 text-xs font-rajdhani">
                        Daily reset limit reached. Try again after 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Password field for RegzAuth users (required by webclient API) */}
                    {isRegzAuthSession && (
                      <div className="relative">
                        <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/40" size={14} />
                        <input
                          type={showRzPwd ? "text" : "password"}
                          placeholder="Enter your Rex South password to reset"
                          value={rzPassword}
                          onChange={(e) => setRzPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-xs font-mono text-white/70 placeholder-white/20 focus:outline-none focus:border-cyan/40 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRzPwd(!showRzPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                        >
                          {showRzPwd ? <HiEyeOff size={14} /> : <HiEye size={14} />}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleHwidReset}
                      disabled={resetting || (isRegzAuthSession && !rzPassword)}
                      className="w-full btn-cyber flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <HiRefresh className={resetting ? "animate-spin" : ""} size={16} />
                      {resetting ? "RESETTING..." : "RESET HWID"}
                    </button>
                  </div>
                )}

              </div>
            )}
          </motion.div>

        </div>

        {/* ════════════════════════════════════════════════════════
            DEVICE MANAGEMENT — Firebase users only
            (RegzAuth users don't have a Firestore devices array)
        ════════════════════════════════════════════════════════ */}
        {!isRegzAuthSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <HiDesktopComputer className="text-cyan/60" size={18} />
                <h3 className="font-orbitron text-xs font-bold text-white/60 tracking-widest">
                  ACTIVE SESSIONS
                </h3>
                {devices.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded font-mono text-xs bg-cyan/10 text-cyan border border-cyan/20">
                    {devices.length}
                  </span>
                )}
              </div>

              {otherDevices.length > 0 && (
                <button
                  onClick={handleRevokeAll}
                  disabled={revokingAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-400/30 text-red-400/60
                             hover:text-red-400 hover:border-red-400/60 font-orbitron text-[10px] tracking-widest
                             transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HiBan size={12} className={revokingAll ? "animate-pulse" : ""} />
                  {revokingAll ? "REVOKING..." : "REVOKE ALL OTHERS"}
                </button>
              )}
            </div>

            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <HiDesktopComputer className="text-white/10" size={36} />
                <p className="font-mono text-white/25 text-xs text-center">
                  No active sessions found.<br />
                  Sessions appear here after your next login.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {devices.map((device) => {
                    const isCurrent  = device.id === currentDeviceId;
                    const isRevoking = revokingId === device.id;
                    return (
                      <motion.div
                        key={device.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isCurrent
                            ? "bg-cyan/5 border-cyan/20"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        }`}
                      >
                        <DeviceIcon os={device.os} isCurrent={isCurrent} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-orbitron text-xs font-semibold text-white/80 truncate">
                              {device.browser}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-cyan/15
                                              border border-cyan/30 font-mono text-[10px] text-cyan leading-none">
                                <HiStatusOnline size={9} />
                                THIS DEVICE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-white/30 text-[11px] mt-0.5">
                            {device.os}
                            <span className="mx-1.5 text-white/15">·</span>
                            {timeAgo(device.lastActive)}
                          </p>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => handleRevokeDevice(device.id)}
                            disabled={isRevoking || !!revokingId}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-red-400/20
                                       text-red-400/40 hover:text-red-400 hover:border-red-400/50
                                       font-orbitron text-[10px] tracking-wider transition-all
                                       disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            {isRevoking
                              ? <div className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                              : <HiTrash size={12} />
                            }
                            {isRevoking ? "..." : "REVOKE"}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <p className="font-mono text-white/20 text-[11px] mt-4 leading-relaxed">
              Revoking a session immediately signs that device out.
              Your current session is never affected.
            </p>
          </motion.div>
        )}

        {/* ── Logout button ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-cyber flex items-center gap-2 border-red-400/40 text-red-400/70 hover:text-red-400 hover:border-red-400"
          >
            <HiLogout size={16} />
            {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
