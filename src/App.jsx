// src/App.jsx
// Developer: AKARSHANA
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider }   from "./context/AuthContext";
import { ToastProvider }  from "./context/ToastContext";
import ProtectedRoute     from "./components/ProtectedRoute";
import AdminRoute         from "./components/AdminRoute";
import ErrorBoundary      from "./components/ErrorBoundary";
import PageLoader         from "./components/PageLoader";   // ← dynamic loader

// PERF: Navbar & Footer lazy-loaded — they import react-icons which adds
// ~30 KB to the initial bundle when eagerly imported.
const Navbar  = lazy(() => import("./components/Navbar"));
const Footer  = lazy(() => import("./components/Footer"));

// PERF: lazy-load every page — initial bundle stays tiny.
const HomePage            = lazy(() => import("./pages/HomePage"));
const AboutPage           = lazy(() => import("./pages/AboutPage"));
const ContactPage         = lazy(() => import("./pages/ContactPage"));
const PublicDownloadsPage = lazy(() => import("./pages/PublicDownloadsPage"));
const AuthPage            = lazy(() => import("./pages/AuthPage"));
const DashboardPage       = lazy(() => import("./pages/portal/DashboardPage"));
const ModeStorePage       = lazy(() => import("./pages/portal/ModeStorePage"));
const SecureDownloadsPage = lazy(() => import("./pages/portal/SecureDownloadsPage"));
const OrdersPage          = lazy(() => import("./pages/portal/OrdersPage"));
const ProfilePage         = lazy(() => import("./pages/portal/ProfilePage"));
const SupportPage         = lazy(() => import("./pages/portal/SupportPage"));
const AdminPage           = lazy(() => import("./pages/admin/AdminPage"));

// PERF: Lightweight placeholder shown while Navbar chunk loads.
// Avoids a full-screen PageLoader flash just for chrome elements.
function NavbarShell() {
  return <div style={{ height: 64, background: "rgba(10,10,15,0.95)" }} />;
}

function Layout({ children, noFooter = false }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<NavbarShell />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      {!noFooter && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

// PERF: After page is idle, preload the chunks users are most likely to need
// next (AuthPage, Navbar, Footer). By the time they click, the chunks are
// already cached — zero wait.
function useIdlePreload() {
  useEffect(() => {
    const preload = () => {
      import("./pages/AuthPage");
      import("./pages/portal/DashboardPage");
      import("./components/Navbar");
      import("./components/Footer");
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(preload, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      // Safari fallback
      const t = setTimeout(preload, 2000);
      return () => clearTimeout(t);
    }
  }, []);
}

function AppRoutes() {
  useIdlePreload();

  return (
    // PageLoader is the Suspense fallback — each lazy load shows a different variant
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Layout><HomePage /></Layout>} />
        <Route path="/about"     element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact"   element={<Layout><ContactPage /></Layout>} />
        <Route path="/downloads" element={<Layout><PublicDownloadsPage /></Layout>} />
        <Route path="/store"     element={<Layout><ModeStorePage /></Layout>} />
        <Route path="/auth"      element={<Layout noFooter><AuthPage /></Layout>} />

        {/* Protected Portal */}
        <Route path="/portal" element={
          <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
        }/>
        <Route path="/portal/store" element={
          <ProtectedRoute><Layout><ModeStorePage /></Layout></ProtectedRoute>
        }/>
        <Route path="/portal/downloads" element={
          <ProtectedRoute><Layout><SecureDownloadsPage /></Layout></ProtectedRoute>
        }/>
        <Route path="/portal/orders" element={
          <ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>
        }/>
        <Route path="/portal/support" element={
          <ProtectedRoute><Layout><SupportPage /></Layout></ProtectedRoute>
        }/>
        <Route path="/portal/profile" element={
          <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
        }/>

        {/* Admin Only */}
        <Route path="/admin" element={
          <AdminRoute><Layout noFooter><AdminPage /></Layout></AdminRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
// Developer: AKARSHANA
