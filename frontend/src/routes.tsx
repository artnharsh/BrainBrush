import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccessPage from "./pages/AuthSuccessPage";

export const router = createBrowserRouter([
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
    ],
  },
]);