// src/pages/AuthSuccessPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const setAuth = useGameStore((state) => state.setAuth);
  
  // A flag to track if we've already processed the login
  const hasProcessed = useRef(false);

  useEffect(() => {
    // If we already ran this, stop immediately.
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/");
      return;
    }

    // 🔒 FIX: Verify the token SERVER-SIDE instead of decoding with atob().
    // This calls GET /auth/me which uses jwt.verify() (cryptographic signature check).
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token verification failed");
        return res.json();
      })
      .then((data) => {
        const user = {
          id: data.user.id,
          username: data.user.username || "Player",
        };

        // Save to global state and local storage
        setAuth(user, token);

        // Safely navigate to the lobby
        navigate("/lobby", { replace: true });
      })
      .catch((err) => {
        console.error("🔴 Token verification failed:", err);
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-700 animate-pulse">
        Authenticating...
      </h2>
    </div>
  );
};

export default AuthSuccessPage;