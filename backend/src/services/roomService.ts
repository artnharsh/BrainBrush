import redis from "../config/redis";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const ROOM_TTL = 3600; // 1 hour in seconds

export const createRoomRedis = async (userId: string) => {
  const roomCode = generateRoomCode();

  // Set the host and players
  await redis.set(`room:${roomCode}:host`, userId);
  await redis.sadd(`room:${roomCode}:players`, userId);

  // Expire BOTH keys so nothing is left behind!
  await redis.expire(`room:${roomCode}:host`, ROOM_TTL);
  await redis.expire(`room:${roomCode}:players`, ROOM_TTL);

  // Return as an object so `const { roomCode } = await createRoom()` works
  return { roomCode, players: [userId] };
};

export const joinRoomRedis = async (roomCode: string, userId: string) => {
  const exists = await redis.exists(`room:${roomCode}:players`);

  if (!exists) throw new Error("Room not found");

  await redis.sadd(`room:${roomCode}:players`, userId);

  const players = await redis.smembers(`room:${roomCode}:players`);

  // Return as an object to match the socket file expectation
  return { players };
};

export const leaveRoomRedis = async (roomCode: string, userId: string) => {
  // Remove the user
  await redis.srem(`room:${roomCode}:players`, userId);

  const players = await redis.smembers(`room:${roomCode}:players`);

  // If room is empty, clean it up early
  if (players.length === 0) {
    await redis.del(`room:${roomCode}:players`);
    await redis.del(`room:${roomCode}:host`);
  }

  // Return as an object
  return { players };
};

// Add this to the bottom of your roomService.ts
export const getRoomRedis = async (roomCode: string) => {
  const exists = await redis.exists(`room:${roomCode}:players`);
  if (!exists) throw new Error("Room not found");

  const players = await redis.smembers(`room:${roomCode}:players`);
  const host = await redis.get(`room:${roomCode}:host`);

  return { roomCode, host, players };
};