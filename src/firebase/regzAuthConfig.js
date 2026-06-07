// Developer: AKARSHANA
// src/firebase/regzAuthConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// RegzAuth / Rex South API credentials.
// Get these from your RegzAuth dashboard → Applications → select your app.
//
// SECURITY NOTE: These are PUBLIC credentials (like Firebase config).
// They identify your application to the RegzAuth API, but they do NOT
// grant anyone admin access. Keep your ownerid secret if it has owner-level
// permissions, but it is safe to ship in frontend code as RegzAuth intends.
// ─────────────────────────────────────────────────────────────────────────────

export const REGZAUTH_NAME    = "Regz-tharukanimsara504-4D696Z";
export const REGZAUTH_OWNERID = "K3mLK0yHFm";
export const REGZAUTH_SECRET  = "84ea64e282d9bde4bafde0c841ad8f5dba31ca998bd86ca49d3c78a2a0878e3e";

// ── Web Client API (new REST endpoints) ──────────────────────────────────────
// These endpoints use JSON bodies and don't require an init/session step.
// Docs: https://api.regzauth.cc/api/webclient/*
export const REGZAUTH_WEBCLIENT_URL = "https://api.regzauth.cc/api/webclient";
