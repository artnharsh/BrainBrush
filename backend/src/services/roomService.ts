import Room from '../models/Room';

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoomService = async (userId: string) => {
    const roomCode = generateRoomCode();

    const room = await Room.create({
        roomCode,
        host: userId,
        players: [userId]
    });
    return room;
};

export const joinRoomService = async(roomCode: string, userId: string) => {
    
    const room = await Room.findOne({ roomCode });

    if(!room) {
        throw new Error("Room not found");
    }

    if(room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
    };

    room.players.push(userId as any);

    await room.save();
    return room;
};

export const getRoomService = async (roomCode: string) => {
    const room = await Room.findOne({ roomCode }).populate("host").populate("players");

    if(!room) {
        throw new Error("Room not found");
    };
    return room;
};