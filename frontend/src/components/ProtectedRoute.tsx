// src/components/ProtectedRoute.tsx
import { useState, useEffect, useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const ProtectedRoute = () => {
  const { isAuthenticated, setAuth, clearAuth } = useGameStore();
  const token = localStorage.getItem("token");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(isAuthenticated);

  // Quick client-side token validity check (no early return — just a flag)
  const tokenStatus = useMemo(() => {
    if (!token) return "missing";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return "expired";
      }
      return "valid";
    } catch {
      return "malformed";
    }
  }, [token]);

  // Clean up bad tokens
  useEffect(() => {
    if (tokenStatus === "expired" || tokenStatus === "malformed") {
      localStorage.removeItem("token");
      clearAuth();
    }
  }, [tokenStatus, clearAuth]);

  // Verify token with the server if Zustand state was wiped (e.g., page refresh)
  useEffect(() => {
    if (tokenStatus !== "valid") return;
    if (isAuthenticated) {
      setIsVerified(true);
      return;
    }

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
        setAuth(
          { id: data.user.id, username: data.user.username || "Player" },
          token!
        );
        setIsVerified(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        clearAuth();
        setIsVerified(false);
      })
      .finally(() => setIsVerifying(false));
  }, [isAuthenticated, token, tokenStatus, setAuth, clearAuth]);

  // 1. No token or bad token? Redirect.
  if (tokenStatus !== "valid") {
    return <Navigate to="/" replace />;
  }

  // 2. Verifying with server? Show loading.
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <p className="font-black text-gray-700 tracking-widest uppercase animate-pulse">
          Verifying session...
        </p>
      </div>
    );
  }

  // 3. Verification done — either show content or redirect
  if (!isVerified) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;