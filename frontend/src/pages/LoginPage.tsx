import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    // If the user is already logged in, don't let them see the login screen!
    if (isAuthenticated) {
      navigate("/lobby", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleGoogleLogin = () => {
    // Send the browser directly to the Express backend
    console.log("🚨 The Google button was clicked!");
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">Skribbl Clone</h2>
        
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-colors"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}