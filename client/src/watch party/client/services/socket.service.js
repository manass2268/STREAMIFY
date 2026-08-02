import { io } from "socket.io-client";

// ==========================================
// 1. BACKEND URL CONFIGURATION
// ==========================================
// Deploy ke waqt .env ka URL lega, nahi toh tera Vercel backend URL
const SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL ||
  "https://streamfiy-backend.vercel.app";

class SocketService {
  constructor() {
    this.socket = null;
  }

  // ==========================================
  // 2. INITIALIZE CONNECTION
  // ==========================================
  connect(userId, displayName, avatar) {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SERVER_URL, {
        query: { userId, displayName, avatar },
        // 🔥 Vercel/Render ke liye polling pehle rakhna best hai
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log(`✅ [SOCKET CONNECTED]: ${this.socket.id}`);
      });

      this.socket.on("connect_error", (err) => {
        console.error("❌ [SOCKET ERROR]:", err.message);
      });
    }
    return this.socket;
  }

  // ==========================================
  // 3. GOOGLE MEET WAITING LOBBY SIGNALING
  // ==========================================
  requestJoinLobby(data) {
    this.socket?.emit("REQUEST_JOIN_LOBBY", data);
  }

  admitUser(userId, roomId) {
    this.socket?.emit("ADMIN_ADMIT_USER", { userId, roomId });
  }

  denyUser(userId, roomId) {
    this.socket?.emit("ADMIN_DENY_USER", { userId, roomId });
  }

  // ==========================================
  // 4. CORE ROOM & MEET SIGNALING
  // ==========================================
  joinRoom(payload) {
    this.socket?.emit("JOIN_ROOM", payload);
  }

  // 🔥 FIX: Room chhodne par socket disconnect nahi karenge, taaki user turant next meeting bana sake
  leaveRoom(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("LEAVE_ROOM", { roomId });
    }
  }

  // App band karte ya logout karte waqt clean disconnect
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Google Meet: Camera aur Mic On/Off toggle karne ke liye
  toggleMediaState(roomId, userId, controlType, status) {
    this.socket?.emit("TOGGLE_MEDIA_STATE", {
      roomId,
      userId,
      controlType,
      status,
    });
  }

  // ==========================================
  // 5. MEDIA PLAYBACK & CHAT (STREAMIFY CORE)
  // ==========================================
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

  // ==========================================
  // 6. EVENT LISTENERS WRAPPERS
  // ==========================================
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
export default socketService;
