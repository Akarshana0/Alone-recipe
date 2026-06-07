// Developer: AKARSHANA
// src/components/ProtectedRoute.jsx — allows Firebase Auth OR RegzAuth sessions

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, rzUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-cyan/50 text-xs tracking-widest">AUTHENTICATING...</span>
        </div>
      </div>
    );
  }

  // Allow through if: Firebase user OR RegzAuth session
  if (!currentUser && !rzUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
