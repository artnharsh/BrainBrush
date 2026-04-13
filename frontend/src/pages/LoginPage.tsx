import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { Brush, BrainCircuit, Users, Zap, Trophy } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    // If the user is already logged in, bypass the login screen
    if (isAuthenticated) {
      navigate("/lobby", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleGoogleLogin = () => {
    // 🚨 Upgraded to use your environment variable so it works locally AND in production!
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-sky-100 font-sans overflow-hidden">
      
      {/* Doodle Background Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{ 
            backgroundImage: "url('/doodle-pattern.png')", 
            backgroundSize: "400px",
            backgroundRepeat: "repeat" 
        }}
      />

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Branding & Info */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          
          <div className="inline-flex items-center gap-3 bg-black text-white px-4 py-2 font-black italic uppercase text-sm md:text-lg mb-6 transform -skew-x-6 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
            <Brush className="text-yellow-400" size={24} />
            <span>Draw. Guess. Dominate.</span>
          </div>
          
          <h1 className="text-7xl md:text-[100px] font-black uppercase tracking-tighter italic leading-none mb-6">
            Brain<span className="text-yellow-400 drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">Brush!</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-gray-800 mb-10 max-w-lg border-l-4 border-black pl-4">
            The ultimate chaotic multiplayer drawing game. Unleash your inner artist (or lack thereof).
          </p>

          {/* Features Mini-Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-white border-4 border-black p-4 font-black uppercase italic text-sm md:text-base flex items-center gap-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-transform">
              <Users size={24} className="text-blue-500"/> Play with friends
            </div>
            <div className="bg-white border-4 border-black p-4 font-black uppercase italic text-sm md:text-base flex items-center gap-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-transform">
              <Zap size={24} className="text-yellow-500"/> Real-time chaos
            </div>
            <div className="bg-white border-4 border-black p-4 font-black uppercase italic text-sm md:text-base flex items-center gap-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-transform">
              <BrainCircuit size={24} className="text-pink-500"/> Test your wits
            </div>
            <div className="bg-white border-4 border-black p-4 font-black uppercase italic text-sm md:text-base flex items-center gap-3 shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-transform">
              <Trophy size={24} className="text-green-500"/> Climb the ranks
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-white border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_rgba(0,0,0,1)] flex flex-col items-center rotate-2 hover:rotate-0 transition-transform duration-300">
            
            <div className="w-24 h-24 bg-yellow-300 border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]">
              <Brush size={48} strokeWidth={2.5} />
            </div>

            <h2 className="text-4xl font-black uppercase italic tracking-tight mb-2 text-center">Ready to Play?</h2>
            <p className="font-bold text-gray-500 text-center mb-10 text-lg">Sign in to save your legacy and claim your identity.</p>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white border-4 border-black hover:bg-yellow-300 text-black py-4 px-6 font-black uppercase text-xl flex items-center justify-center gap-4 transition-all active:translate-y-2 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
            >
              {/* Custom Google "G" SVG */}
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
            
            <p className="mt-8 text-xs font-black text-gray-400 uppercase tracking-widest text-center border-t-2 border-gray-100 pt-6 w-full">
              No extra setup required
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}