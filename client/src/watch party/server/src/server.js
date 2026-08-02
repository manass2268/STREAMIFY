const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const roomStore = require("./socket/store/roomStore"); // 🔥 Imported Room Store
const roomHandler = require("./socket/handlers/room.handler");
const lobbyHandler = require("./socket/handlers/lobby.handler");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
});

// ==================== REST API ROUTES ====================

// 1. Create a new Room (Host Only)
app.post("/api/rooms", (req, res) => {
  const { roomId, hostId } = req.body;
  if (!roomId || !hostId)
    return res.status(400).json({ error: "Missing data" });

  if (roomStore.getRoom(roomId)) {
    return res.status(400).json({ error: "Room code already exists" });
  }

  const room = roomStore.createRoom(
    roomId,
    hostId,
    "Streamify Meet Room",
    true,
  );
  res.status(201).json({ success: true, room });
});

// 2. Validate Room Entry (Guests & Direct Links)
app.get("/api/rooms/:roomId", (req, res) => {
  const room = roomStore.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found or expired" });
  }
  res.status(200).json({ success: true, room });
});

// =========================================================

io.on("connection", (socket) => {
  console.log(`[SOCKET CONNECTED]: ${socket.id}`);
  roomHandler(io, socket);
  lobbyHandler(io, socket);
  socket.on("disconnect", () => {
    console.log(`[SOCKET DISCONNECTED]: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Streamify Meet Engine Server running on PORT: ${PORT}`);
});
