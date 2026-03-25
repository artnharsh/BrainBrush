// src/pages/AuthSuccessPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const setAuth = useGameStore((state) => state.setAuth);
  
  // 1. ADD THIS: A flag to track if we've already processed the login
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 2. ADD THIS: If we already ran this, stop immediately.
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      // Decode the JWT
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      
      const user = {
        id: payload.id,
        username: "Player", 
      };

      // Save to global state and local storage
      setAuth(user, token);

      // Safely navigate to the lobby
      navigate("/lobby", { replace: true });
    } catch (err) {
      console.error("🔴 CRITICAL ERROR: Failed to parse the token!", err);
      navigate("/"); 
    }
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