// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const ProtectedRoute = () => {
  const { isAuthenticated, setAuth } = useGameStore();
  const token = localStorage.getItem("token");

  // 1. No token at all? Kick them out immediately.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Token exists, but Zustand wiped on refresh? Restore it instantly.
  if (!isAuthenticated && token) {
    try {
      // Decode the JWT (atob is a built-in browser function to decode Base64)
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // Update Zustand synchronously before the page renders
      setAuth({ id: payload.id, username: payload.username || "Player" }, token);
    } catch (error) {
      console.error("Invalid token on refresh", error);
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }
  }

  // 3. User is safe. Let them see the page.
  return <Outlet />;
};

export default ProtectedRoute;