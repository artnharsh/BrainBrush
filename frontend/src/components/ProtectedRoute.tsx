// src/components/ProtectedRoute.tsx
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const ProtectedRoute = () => {
  const { isAuthenticated, setAuth, clearAuth } = useGameStore();
  const token = localStorage.getItem("token");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(isAuthenticated);

  // 1. No token at all? Kick them out immediately.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Quick client-side expiry check (prevents obviously expired tokens
  //    from even hitting the server).
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token is expired — clean up and redirect
      localStorage.removeItem("token");
      clearAuth();
      return <Navigate to="/" replace />;
    }
  } catch {
    // Malformed token — can't even decode the structure
    localStorage.removeItem("token");
    clearAuth();
    return <Navigate to="/" replace />;
  }

  // 3. Token exists but Zustand wiped on refresh? Verify server-side.
  useEffect(() => {
    if (isAuthenticated) {
      setIsVerified(true);
      return;
    }

    // 🔒 FIX: Verify token with the server instead of trusting atob() decode.
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    setIsVerifying(true);

    fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        // Server confirmed the token is valid — restore Zustand state
        setAuth(
          { id: data.user.id, username: data.user.username || "Player" },
          token!
        );
        setIsVerified(true);
      })
      .catch(() => {
        // Server rejected the token — clean up
        localStorage.removeItem("token");
        clearAuth();
        setIsVerified(false);
      })
      .finally(() => setIsVerifying(false));
  }, [isAuthenticated, token, setAuth, clearAuth]);

  // 4. Show nothing while verifying (prevents flash of protected content)
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <p className="font-black text-gray-700 tracking-widest uppercase animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  // 5. Verification done — either show content or redirect
  if (!isVerified) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;