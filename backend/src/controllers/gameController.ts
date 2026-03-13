import { Request, Response } from "express";
import GameHistory from "../models/GameHistory";

export const saveGameHistory = async(req: Request, res: Response) => {
    try {
        const { roomCode, players, scores, winner, rounds } = req.body;

        const game = await GameHistory.create({
            roomCode,
            players,
            scores,
            winner,
            rounds
        });

        res.status(201).json(game);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error saving game history:", error.message);
        }
        res.status(500).json({ message: "Error saving game history" });
    };
};

export const getPlayerHistory = async(req: Request, res: Response) => {
    try {
        const userId = (req as any ).params.user.id;

        const history = await GameHistory.find({ players: userId })
          .populate("players winner")
          .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching player history:", error.message);
        }
        res.status(500).json({ message: "Error fetching player history" });
    };
};