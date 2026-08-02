const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const roomStore = require("./socket/store/roomStore");
const registerRoomHandlers = require("./socket/handlers/room.handler");
const registerLobbyHandlers = require("./socket/handlers/lobby.handler");

const app = express();
const server = http.createServer(app);

// ==========================================================
// 🔥 1. ROBUST CORS & PREFLIGHT CONFIGURATION FOR VERCEL
// ==========================================================
app.use(
  cors({
    origin: "*", // Ya apna exact frontend origin: "https://streamify-app-ms.vercel.app"
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Explicitly handle all preflight OPTIONS requests across all routes
app.options("*", cors());

app.use(express.json());

// ==========================================================
// 🔥 2. SOCKET.IO SETUP
// ==========================================================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// ==========================================================
// 🔥 3. REST API: ROOM CREATION & VALIDATION
// ==========================================================

// Create/Provision a new meeting room
app.post("/api/rooms", (req, res) => {
  try {
    const { roomId, hostId } = req.body;

    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "Room ID is required" });
    }

    // Register room in store
    roomStore.createRoom(roomId, hostId);
    console.log(
      `[API Room Created]: ${roomId} by host ${hostId || "Anonymous"}`,
    );

    return res
      .status(200)
      .json({
        success: true,
        roomId,
        message: "Room provisioned successfully",
      });
  } catch (error) {
    console.error("[API Error creating room]:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Validate if room exists before joining
app.get("/api/rooms/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;
    const room = roomStore.getRoom(roomId);

    if (!room) {
      return res
        .status(404)
        .json({
          success: false,
          message: "This meeting link is invalid or has expired.",
        });
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("[API Error validating room]:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Root Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("Streamify Watch Party & Meet Backend is Live! 🚀");
});

// ==========================================================
// 🔥 4. SOCKET.IO CONNECTION & EVENT ROUTING
// ==========================================================
io.on("connection", (socket) => {
  console.log(`⚡ [Socket Connected]: ${socket.id}`);

  // Register modular socket handlers
  registerRoomHandlers(io, socket, roomStore);
  registerLobbyHandlers(io, socket, roomStore);

  socket.on("disconnect", (reason) => {
    console.log(`⚠️ [Socket Disconnected]: ${socket.id} due to ${reason}`);
  });
});

// ==========================================================
// 🔥 5. SERVER START (Local & Serverless Compatible)
// ==========================================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`🚀 Watch Party Server running locally on port ${PORT}`);
  });
}

// Export for Serverless / Vercel deployment if required
module.exports = { app, server, io };
