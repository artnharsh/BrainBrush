const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
    },
     players: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: {
                type: String,
            },
            score: {
                type: Number,
                default: 0,
            }
        }
     ],
     currentDrawer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
     },
     currentWord: {
        type: String,
     },
     round: {
        type: Number,
        default: 1,
     },
     gameStatus: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
     }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);