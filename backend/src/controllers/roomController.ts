// import { Request, Response } from "express";
// import {
//   createRoomRedis,
//   joinRoomRedis,
//   getRoomRedis, // <-- Make sure to import the new function we just made
// } from "../services/roomService";

// export const createRoom = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.id;
//     const room = await createRoomRedis(userId);
//     res.status(201).json(room);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "An unknown error occurred" });
//     }
//   }
// };

// export const joinRoom = async (req: Request, res: Response) => {
//   try {
//     const { roomCode } = req.body;
//     const userId = (req as any).user.id;

//     if (!roomCode) {
//       return res.status(400).json({ message: "Room code is required" });
//     }

//     const room = await joinRoomRedis(roomCode, userId);
//     res.status(200).json(room);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(400).json({ message: error.message }); // Changed to 400 since "Room not found" is a client error
//     } else {
//       res.status(500).json({ message: "An unknown error occurred" });
//     }
//   }
// };

// export const getRoom = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const room = await getRoomRedis(id);
//     res.status(200).json(room);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(404).json({ message: error.message }); // 404 for Not Found
//     } else {
//       res.status(500).json({ message: "An unknown error occurred" });
//     }
//   }
// };
