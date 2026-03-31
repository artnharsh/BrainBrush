// src/components/ChatBox.tsx
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";

export default function ChatBox() {
  const [guess, setGuess] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket } = useSocket();
  const roomCode = useGameStore((state) => state.roomCode);
  const messages = useGameStore((state) => state.messages);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);

  const isMyTurn = user?.id === currentDrawer;

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || !roomCode || isMyTurn) return;

    // Send the guess to the backend!
    socket.emit("guess_word", { roomCode, guess });
    setGuess("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-yellow-300 border-b-4 border-black p-4">
        <h3 className="text-xl font-black uppercase tracking-widest">Chat & Guesses</h3>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-3 border-2 border-black rounded-lg font-bold ${
              msg.type === 'success' ? 'bg-green-300 text-black' : 
              msg.type === 'system' ? 'bg-gray-200 text-gray-600 italic text-center text-sm border-dashed' : 
              'bg-white'
            }`}
          >
            {msg.type !== 'system' && (
              <span className="text-gray-500 mr-2">{msg.sender}:</span>
            )}
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleGuess} className="p-4 bg-white border-t-4 border-black flex gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={isMyTurn}
          placeholder={isMyTurn ? "You are drawing!" : "Type your guess..."}
          className="flex-1 border-4 border-black p-3 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-200"
        />
        <button 
          type="submit"
          disabled={isMyTurn || !guess.trim()}
          className="bg-blue-400 hover:bg-blue-500 text-black border-4 border-black px-6 rounded-xl font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
        >
          SEND
        </button>
      </form>
      
    </div>
  );
}