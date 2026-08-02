const roomStore = require("../store/roomStore");

module.exports = (io, socket) => {
  // 1. Guest asks permission to join the meeting room
  socket.on("REQUEST_JOIN_LOBBY", (payload) => {
    const { roomId, userId, displayName, avatar, peerId } = payload;
    let room = roomStore.getRoom(roomId);

    // Agar room tabhi tak nahi bana, toh temporary host assignment (fallback)
    if (!room) {
      socket.emit("LOBBY_REJECTED", { reason: "ROOM_NOT_FOUND" });
      return;
    }

    // Check if user is already approved (Host ya returning user)
    if (roomStore.isUserApproved(roomId, userId)) {
      socket.emit("LOBBY_APPROVED", { roomId });
      return;
    }

    // Add guest to Lobby Queue
    const requestData = {
      userId,
      socketId: socket.id,
      displayName,
      avatar,
      peerId,
      requestedAt: Date.now(),
    };
    roomStore.addLobbyRequest(roomId, requestData);

    console.log(
      `[LOBBY] ${displayName} (${userId}) waiting for room: ${roomId}`,
    );

    // Notify all participants in room (mostly the Host)
    socket.to(roomId).emit("LOBBY_JOIN_REQUEST", requestData);
  });

  // 2. Host clicks ADMIT on the notification popup
  socket.on("ADMIN_ADMIT_USER", ({ userId, roomId }) => {
    const room = roomStore.getRoom(roomId);
    if (!room) return;

    roomStore.approveUser(roomId, userId);
    console.log(`[LOBBY] Host admitted user: ${userId} to room: ${roomId}`);

    // Send direct signal to the waiting guest's socket
    const waitingUser = Array.from(room.lobbyQueue.values()).find(
      (u) => u.userId === userId,
    );
    io.emit("LOBBY_APPROVED", { userId, roomId });
  });

  // 3. Host clicks DENY on the notification popup
  socket.on("ADMIN_DENY_USER", ({ userId, roomId }) => {
    roomStore.removeLobbyRequest(roomId, userId);
    console.log(`[LOBBY] Host denied user: ${userId} from room: ${roomId}`);

    io.emit("LOBBY_REJECTED", { userId, roomId });
  });
};
