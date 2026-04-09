// backend/src/sockets/drawingSocket.ts
import { Server } from "socket.io";
import { AuthenticatedSocket, DrawLinePayload, EraseStrokePayload, ClearCanvasPayload, CanvasSnapshotPayload } from "../types/socketTypes";

export const activeDrawers = new Map<string, string>();

export const drawingSocket = (io: Server, socket: AuthenticatedSocket): void => {

    // Relay draw line from drawer to all other players
    socket.on("draw_line", (data: DrawLinePayload): void => {
        try {
            if (!data.roomCode) return;
            if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
            socket.to(data.roomCode).emit("draw_line", data.segment);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            socket.emit("error", { message: `Error drawing: ${errorMessage}` });
        }
    });

    // Relay erase stroke command from drawer to all other players
    socket.on("erase_stroke", (data: EraseStrokePayload): void => {
        try {
            if (!data.roomCode) return;
            if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
            socket.to(data.roomCode).emit("erase_stroke", data.strokeId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            socket.emit("error", { message: `Error erasing: ${errorMessage}` });
        }
    });

    // Clear entire canvas from drawer
    socket.on("clear_canvas", (data: ClearCanvasPayload): void => {
        try {
            if (!data.roomCode) return;
            if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
            socket.to(data.roomCode).emit("clear_canvas", {});
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            socket.emit("error", { message: `Error clearing canvas: ${errorMessage}` });
        }
    });

    // New player requests current canvas state
    socket.on("request_canvas_sync", (roomCode: string): void => {
        try {
            socket.to(roomCode).emit("send_canvas_snapshot", { targetSocketId: socket.id });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            socket.emit("error", { message: `Error syncing canvas: ${errorMessage}` });
        }
    });

    // Drawer delivers canvas snapshot to new player
    socket.on("deliver_canvas_snapshot", (data: CanvasSnapshotPayload): void => {
        try {
            io.to(data.targetSocketId).emit("receive_canvas_snapshot", { segments: data.segments });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            socket.emit("error", { message: `Error delivering canvas: ${errorMessage}` });
        }
    });
};