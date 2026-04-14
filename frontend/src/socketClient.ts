import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Export exactly one instance of the socket connection
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // CRITICAL: Wait for the token before connecting
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("🔴 Connection aborted: No JWT found.");
    return;
  }
  
  // The Auth Handshake: Securely pass the token to the server
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};