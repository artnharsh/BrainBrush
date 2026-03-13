import {Request, Response} from "express";
import {
    createRoomService,
    joinRoomService,
    getRoomService
} from "../services/roomService";

export const createRoom = async (req: Request, res: Response) => {
    try {

        const userId = (req as any).user.id;
        const room = await createRoomService(userId);
        res.status(201).json(room);
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        };
    };
};

export const joinRoom = async(req: Request, res: Response) => {
    try {
        const { roomCode } = req.body;
        const userId = (req as any).user.id;
        const room = await joinRoomService(roomCode, userId);
        res.status(200).json(room);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    };
};

export const getRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const room = await getRoomService(id);
        res.status(200).json(room);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        };
    };
};