const Room = require('../models/Room');

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const createRoom = async (req, res) => {
    try {
        
        const userId = req.userId;
        const roomCode = generateRoomCode();

        const room = await Room.create({
            roomCode,
            players: [
                {
                    userId,
                    username: req.body.username,
                    score: 0
                }
            ],
        });

        res.status(201).json({
            message: 'Room created successfully',
            room,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const joinRoom = async (req, res) => {
    try {
        const { roomCode, userId, username } = req.body;
        const room = await Room.findOne({ roomCode });

        if(!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.players.push({
            userId,
            username,
            score: 0
        });

        await room.save();

        res.status(200).json({
            message: 'Joined room ',
            room,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRoom = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if(!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            room,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createRoom,
    joinRoom,
    getRoom,
}