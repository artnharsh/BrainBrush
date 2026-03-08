const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authmiddleware");

router.post("/create-room", authMiddleware, roomController.createRoom);
router.post("/join-room", authMiddleware, roomController.joinRoom);
router.get("/room/:id", authMiddleware, roomController.getRoom);

module.exports = router;
