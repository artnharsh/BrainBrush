// src/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes"; // <-- IMPORTANT: Named import
import { useGameStore } from "./store/useGameStore";

function App() {
  const setAuth = useGameStore((state) => state.setAuth);

  // HYDRATION: Restore the session from local storage before rendering the game
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Synchronously update the global store
        setAuth({ id: payload.id, username: payload.username || "Player" }, token);
      } catch (err) {
        console.error("Corrupted token found during hydration. Clearing session.", err);
        localStorage.removeItem("token");
      }
    }
  }, [setAuth]);

  // Provide the modern v6 router to the app
  return <RouterProvider router={router} />;
}

export default App;