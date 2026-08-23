// src/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes"; // <-- IMPORTANT: Named import
import { useGameStore } from "./store/useGameStore";
import { useErrorHandler } from "./hooks/useErrorHandler";

function App() {
  const setAuth = useGameStore((state) => state.setAuth);
  const { handleError } = useErrorHandler();

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

  useEffect(() => {
    const onWindowError = (event: ErrorEvent): void => {
      handleError(event.error || event.message, "runtime");
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
      handleError(event.reason, "runtime");
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [handleError]);

  // Provide the modern v6 router to the app
  return <RouterProvider router={router} />;
}

export default App;