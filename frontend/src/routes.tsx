import { createBrowserRouter, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import PlayerHistoryPage from "./pages/PlayerHistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccessPage from "./pages/AuthSuccessPage";
import SessionConflictModal from "./components/SessionConflictModal";

// Root layout that wraps ALL routes — ensures the session conflict modal is always active
function RootLayout() {
  return (
    <>
      <Outlet />
      <SessionConflictModal />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      { path: "/auth/success", element: <AuthSuccessPage /> },
      {
        path: "/",
        element: <ProtectedRoute />, // Everything inside here is protected
        children: [
          {
            path: "lobby",
            element: <LobbyPage />,
          },
          {
            path: "game",
            element: <GamePage />,
          },
          {
            path: "history",
            element: <PlayerHistoryPage />,
          },
        ],
      },
    ],
  },
]);