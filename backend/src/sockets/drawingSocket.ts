import { Server } from "socket.io";
import { AuthenticatedSocket, EraseStrokePayload, ClearCanvasPayload, CanvasSnapshotPayload, CanvasSegment } from "../types/socketTypes";
import redis from "../config/redis";

export const activeDrawers = new Map<string, string>();

export const drawingSocket = (io: Server, socket: AuthenticatedSocket): void => {

    // Relay draw line batch from drawer to all other players
    socket.on("draw_line_batch", async (data: { roomCode: string, segments: CanvasSegment[] }): Promise<void> => {
        try {
            if (!data.roomCode) return;
            if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
            socket.to(data.roomCode).emit("draw_line_batch", data.segments);

            // SERVER SIDE CACHE: Save to Redis for late joiners!
            if (data.segments && data.segments.length > 0) {
                const serializedSegments = data.segments.map(s => JSON.stringify(s));
                await redis.rpush(`room:${data.roomCode}:canvas`, ...serializedSegments);
                await redis.expire(`room:${data.roomCode}:canvas`, 3600);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`[drawingSocket] Error drawing batch:`, error);
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
            console.error(`[drawingSocket] Error erasing:`, error);
            socket.emit("error", { message: `Error erasing: ${errorMessage}` });
        }
    });

    // Clear entire canvas from drawer
    socket.on("clear_canvas", async (roomCode: string): Promise<void> => {
        try {
            if (!roomCode) return;
            if (activeDrawers.get(roomCode) !== socket.user?.id) return;
            socket.to(roomCode).emit("clear_canvas", {});
            await redis.del(`room:${roomCode}:canvas`); // Wipe the cache
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`[drawingSocket] Error clearing canvas:`, error);
            socket.emit("error", { message: `Error clearing canvas: ${errorMessage}` });
        }
    });

    // New player requests current canvas state
    socket.on("request_canvas_sync", async (roomCode: string): Promise<void> => {
        try {
            const canvasData = await redis.lrange(`room:${roomCode}:canvas`, 0, -1);
            if (canvasData && canvasData.length > 0) {
                const segments = canvasData.map(s => JSON.parse(s));
                socket.emit("receive_canvas_snapshot", { segments });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`[drawingSocket] Error syncing canvas:`, error);
            socket.emit("error", { message: `Error syncing canvas: ${errorMessage}` });
        }
    });

    // Drawer delivers canvas snapshot to new player
    socket.on("deliver_canvas_snapshot", (data: CanvasSnapshotPayload): void => {
        try {
            io.to(data.targetSocketId).emit("receive_canvas_snapshot", { segments: data.segments });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`[drawingSocket] Error delivering canvas:`, error);
            socket.emit("error", { message: `Error delivering canvas: ${errorMessage}` });
        }
    });
};