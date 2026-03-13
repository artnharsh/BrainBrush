import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true
    },

    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    maxPlayers: {
        type: Number,
        default: 4
    },
    Status: {
        type: String,
        enum: ["waiting", "playing", "finished"],
        default: "waiting"
    },
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;