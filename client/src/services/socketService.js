import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId, userName, avatar) {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        query: { userId, userName, avatar },
        // 🔥 FIX: 'polling' aur 'websocket' dono allow karo taaki mobile/LAN devices crash na hon
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    return this.socket;
  }

  // ==========================================
  // 1. GOOGLE MEET WAITING LOBBY SIGNALING 🔥
  // ==========================================

  // Guest (Phone user) asks permission to join the room
  requestJoinLobby(data) {
    this.socket?.emit("REQUEST_JOIN_LOBBY", data);
  }

  // Host Admits a pending user from the waiting queue
  admitUser(remoteUserId, roomId) {
    this.socket?.emit("ADMIN_ADMIT_USER", { userId: remoteUserId, roomId });
  }

  // Host Denies/Rejects a pending user
  denyUser(remoteUserId, roomId) {
    this.socket?.emit("ADMIN_DENY_USER", { userId: remoteUserId, roomId });
  }

  // ==========================================
  // 2. STANDARD ROOM & STREAM METHODS
  // ==========================================

  joinRoom({ roomId, userId, userName, avatar, isHost }) {
    this.socket?.emit("JOIN_ROOM", {
      roomId,
      userId,
      userName,
      avatar,
      isHost,
    });
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit("LEAVE_ROOM", { roomId });
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitPlay(roomId, currentTime) {
    this.socket?.emit("MEDIA_PLAY", { roomId, currentTime });
  }

  emitPause(roomId, currentTime) {
    this.socket?.emit("MEDIA_PAUSE", { roomId, currentTime });
  }

  emitSeek(roomId, currentTime) {
    this.socket?.emit("MEDIA_SEEK", { roomId, currentTime });
  }

  emitMovieSelect(roomId, movie) {
    this.socket?.emit("MEDIA_SELECT", { roomId, movie });
  }

  sendMessage(roomId, messagePayload) {
    this.socket?.emit("CHAT_MESSAGE", { roomId, ...messagePayload });
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
export default socketService;
