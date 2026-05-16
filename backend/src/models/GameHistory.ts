import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true
  },

  // ✅ FIXED: ObjectId instead of String
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],

  scores: [
    {
      player: { 
        type: String, 
        required: true 
      },
      playerId: {
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
    type: String 
  },

  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // ✅ NEW (denormalization → removes populate)
  winnerName: String,

  rounds: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

/* ✅ INDEXES (THIS IS WHY YOU GET FAST RESPONSE) */
gameHistorySchema.index({ players: 1, createdAt: -1 });
gameHistorySchema.index({ winner: 1 });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;