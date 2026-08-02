const roomStore = require("../store/roomStore");

module.exports = (io, socket) => {
  // 1. Enter Room Namespace
  socket.on("JOIN_ROOM", (payload) => {
    const { roomId, user } = payload;
    let room = roomStore.getRoom(roomId);

    // Ensure room exists
    if (!room) {
      socket.emit("LOBBY_REJECTED", { reason: "ROOM_NOT_FOUND" });
      return;
    }

    // Security check: Verify if user is approved to bypass lobby
    if (!roomStore.isUserApproved(roomId, user.userId)) {
      socket.emit("LOBBY_REJECTED", { reason: "UNAUTHORIZED_ENTRY" });
      return;
    }

    // Add user to room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = user.userId;

    const participantData = {
      ...user,
      socketId: socket.id,
      joinedAt: Date.now(),
    };
    roomStore.addParticipant(roomId, participantData);

    console.log(`[ROOM] ${user.displayName} joined room: ${roomId}`);

    // Send existing participants to the newcomer
    const allParticipants = roomStore.getParticipantsList(roomId);
    socket.emit("ROOM_STATE_UPDATE", {
      roomId,
      title: room.title,
      participants: allParticipants,
    });

    // Notify other peers to trigger WebRTC Call (PeerJS)
    socket.to(roomId).emit("USER_JOINED", {
      userId: user.userId,
      peerId: user.peerId,
      displayName: user.displayName,
      avatar: user.avatar,
    });
  });

  // 2. Hardware state toggle signaling (Mic / Cam / Screen Share)
  socket.on("TOGGLE_MEDIA_STATE", ({ roomId, userId, controlType, status }) => {
    const room = roomStore.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(userId);
    if (participant && participant.mediaStatus) {
      if (controlType === "MIC") participant.mediaStatus.isMicOn = status;
      if (controlType === "CAM") participant.mediaStatus.isCamOn = status;
      if (controlType === "SCREEN")
        participant.mediaStatus.isScreenSharing = status;
    }

    socket
      .to(roomId)
      .emit("PARTICIPANT_MEDIA_UPDATED", { userId, controlType, status });
  });

  // 3. Leave Room & Clean up
  const handleLeave = () => {
    if (!socket.roomId || !socket.userId) return;

    console.log(`[ROOM] User disconnected/left: ${socket.userId}`);
    roomStore.removeParticipant(socket.roomId, socket.userId);

    io.to(socket.roomId).emit("USER_LEFT", { userId: socket.userId });
    socket.leave(socket.roomId);
  };

  socket.on("LEAVE_ROOM", handleLeave);
  socket.on("disconnect", handleLeave);
};
