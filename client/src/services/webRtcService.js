import Peer from "peerjs";

class WebRtcService {
  constructor() {
    this.peer = null;
    this.localStream = null;
    this.screenStream = null;
    this.peers = new Map();
    this.remoteStreams = new Map();
    this.onRemoteStreamCallback = null;
    this.onPeerDisconnectCallback = null;
  }

  async initialize(userId, onRemoteStream, onPeerDisconnect) {
    this.onRemoteStreamCallback = onRemoteStream;
    this.onPeerDisconnectCallback = onPeerDisconnect;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (error) {
      console.warn(
        "Camera/Mic access denied. Fallback to empty stream.",
        error,
      );
      this.localStream = new MediaStream();
    }

    return new Promise((resolve, reject) => {
      this.peer = new Peer(userId, {
        host: import.meta.env.VITE_PEER_SERVER_HOST || "0.peerjs.com",
        port: import.meta.env.VITE_PEER_SERVER_PORT || 443,
        secure: true,
      });

      this.peer.on("open", (id) => resolve(id));
      this.peer.on("error", (err) => reject(err));

      this.peer.on("call", (call) => {
        call.answer(this.localStream);
        this.handleCallStream(call);
      });
    });
  }

  connectToNewUser(remoteUserId) {
    if (!this.peer || !this.localStream) return;
    const call = this.peer.call(remoteUserId, this.localStream);
    this.handleCallStream(call);
  }

  handleCallStream(call) {
    call.on("stream", (remoteStream) => {
      this.remoteStreams.set(call.peer, remoteStream);
      this.onRemoteStreamCallback?.(call.peer, remoteStream);
    });

    call.on("close", () => {
      this.remoteStreams.delete(call.peer);
      this.onPeerDisconnectCallback?.(call.peer);
    });

    this.peers.set(call.peer, call);
  }

  toggleAudio(isMuted) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }

  toggleVideo(isCamOn) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = isCamOn;
    });
  }

  async startScreenShare(onEndedCallback) {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });

      const videoTrack = this.screenStream.getVideoTracks()[0];
      this.peers.forEach((call) => {
        const sender = call.peerConnection
          .getSenders()
          .find((s) => s.track.kind === "video");
        sender?.replaceTrack(videoTrack);
      });

      videoTrack.onended = () => {
        this.stopScreenShare();
        onEndedCallback?.();
      };

      return this.screenStream;
    } catch (error) {
      console.error("Failed to start screen sharing:", error);
      throw error;
    }
  }

  stopScreenShare() {
    if (!this.localStream || !this.screenStream) return;
    const originalVideoTrack = this.localStream.getVideoTracks()[0];

    this.peers.forEach((call) => {
      const sender = call.peerConnection
        .getSenders()
        .find((s) => s.track.kind === "video");
      sender?.replaceTrack(originalVideoTrack);
    });

    this.screenStream.getTracks().forEach((track) => track.stop());
    this.screenStream = null;
  }

  cleanup() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.screenStream?.getTracks().forEach((track) => track.stop());
    this.peer?.destroy();
    this.peers.clear();
    this.remoteStreams.clear();
  }
}

export const webRtcService = new WebRtcService();
export default webRtcService;
