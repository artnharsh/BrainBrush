import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env'; 
import { AuthenticatedSocket } from '../types/socketTypes';

export const initSocket = (io: Server) => {
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if(!token) {
                return next(new Error('Authentication error: No token provided'));
            };

            const decoded = jwt.verify(token, JWT_SECRET) as any;

            socket.user = {
                id: decoded.id
            };
            next();

        } catch (err) {            
            console.error('Socket authentication error:', err);
            return next(new Error('Authentication error'));
        };
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
      console.log("User Connected: ", socket.user?.id);

      socket.on("disconnect", () => {
        console.log("User Disconnected: ", socket.user?.id);
      });
    });
};

