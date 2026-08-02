/**
 * STREAMIFY MEET ENGINE – PHASE 1
 * Thread-safe In-Memory Store for Active Rooms & Waiting Lobby
 */

class RoomStore {
  constructor() {
    // Map<roomId, RoomState>
    this.rooms = new Map();
  }

  createRoom(roomId, hostId, title = "Untitled Meeting", isLocked = true) {
    const newRoom = {
      roomId,
      title,
      hostId,
      isLocked,
      createdAt: Date.now(),
      participants: new Map(), // Map<userId, ParticipantData>
      lobbyQueue: new Map(), // Map<userId, RequestData>
      approvedUsers: new Set([hostId]),
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  // ==================== PARTICIPANT METHODS ====================

  addParticipant(roomId, participantData) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    room.participants.set(participantData.userId, participantData);
    return participantData;
  }

  removeParticipant(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    return room.participants.delete(userId);
  }

  getParticipantsList(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  // ==================== LOBBY WAITING QUEUE ====================

  addLobbyRequest(roomId, requestData) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    room.lobbyQueue.set(requestData.userId, requestData);
    return requestData;
  }

  removeLobbyRequest(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    return room.lobbyQueue.delete(userId);
  }

  approveUser(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.approvedUsers.add(userId);
    this.removeLobbyRequest(roomId, userId);
    return true;
  }

  isUserApproved(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;
    return !room.isLocked || room.approvedUsers.has(userId);
  }
}

module.exports = new RoomStore();
