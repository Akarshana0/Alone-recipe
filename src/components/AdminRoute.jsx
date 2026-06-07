// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AdminRoute — Only users with role === "admin" in Firestore can access.
 * Everyone else gets redirected to home.
 */
export default function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan rounded-full border-t-transparent animate-spin" />
          <span className="font-mono text-cyan/70 text-xs tracking-widest">VERIFYING ACCESS...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
