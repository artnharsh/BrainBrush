import mongoose from "mongoose";
import { ref } from "node:process";

const gameHistorySchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true
    },
    players: [
        {
            type: String,
            ref: "User"
        }
    ],
    scores: [
        {
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            score: {
                type: Number,
                required: true
            }
        }
    ],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rounds: {
        type: Number,
        default: 1,
    }
}, { timestamps: true });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;