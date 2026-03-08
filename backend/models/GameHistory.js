const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    players: [
        {
            username: String,
            score: Number,
        }
    ],
    winner: {
        type: String,
    },
    roundsPlayed: {
        type: Number,
    }
}, { timestamps: true });

module.exports = mongoose.model('GameHistory', gameHistorySchema);