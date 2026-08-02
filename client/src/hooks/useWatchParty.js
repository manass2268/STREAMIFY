import { useState, useEffect, useCallback } from "react";
import socketService from "../services/socketService";
import webRtcService from "../services/webRtcService";
import { auth } from "../firebase";

export default function useWatchParty(showCustomToast) {
  const [wpState, setWpState] = useState({
    inRoom: false,
    inLobby: false, // 🔥 NEW: True jab guest host ke allow karne ka wait kar raha ho
    roomId: "",
    isHost: false,
    isMuted: false,
    isCamOn: true,
    isScreenSharing: false,
    isRecording: false,
    activeTab: "chat",
    chatInput: "",
    messages: [
      {
        id: 1,
        sender: "System",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: "Welcome to the Streamify Watch Party! 🍿",
        isMe: false,
        avatar: "🤖",
      },
    ],
    participants: [],
    lobbyQueue: [], // 🔥 NEW: Host ke samne in users ka approval popup aayega
    remoteStreams: {},
    activeMovie: null,
    isPlaying: true,
    progress: 0,
    showCC: false,
    isFullscreen: false,
  });

  const [localStream, setLocalStream] = useState(null);

  const currentUser = auth.currentUser;
  // 🔥 Localhost/LAN isolation taaki har window/phone ki ID unique rahe
  const userId =
    currentUser?.uid || `user_${Math.random().toString(36).substring(2, 9)}`;
  const userName =
    currentUser?.displayName || `Member ${userId.substring(0, 4)}`;
  const avatar = "👦";

  const handleRemoteStream = useCallback((peerId, stream) => {
    setWpState((prev) => ({
      ...prev,
      remoteStreams: { ...prev.remoteStreams, [peerId]: stream },
    }));
  }, []);

  const handlePeerDisconnect = useCallback((peerId) => {
    setWpState((prev) => {
      const updatedStreams = { ...prev.remoteStreams };
      delete updatedStreams[peerId];
      return {
        ...prev,
        remoteStreams: updatedStreams,
        participants: prev.participants.filter((p) => p.id !== peerId),
      };
    });
  }, []);

  // =======================================================
  // 1. SOCKET & WEBRTC EVENT LISTENERS (LOBBY + ROOM ENGINE)
  // =======================================================
  useEffect(() => {
    if (!wpState.roomId) return;

    let isMounted = true;

    // 🔥 A. LOBBY EVENT: Host ke samne request aana
    socketService.on(
      "LOBBY_JOIN_REQUEST",
      ({ userId: reqId, userName: reqName, avatar: reqAvatar }) => {
        if (!wpState.isHost) return;
        showCustomToast?.(`${reqName} wants to join the room`, "info");
        setWpState((prev) => {
          const exists = prev.lobbyQueue.some((u) => u.id === reqId);
          if (exists) return prev;
          return {
            ...prev,
            lobbyQueue: [
              ...prev.lobbyQueue,
              { id: reqId, name: reqName, avatar: reqAvatar },
            ],
          };
        });
      },
    );

    // 🔥 B. LOBBY EVENT: Guest ko Host ne Admit kar liya
    socketService.on("LOBBY_APPROVED", () => {
      showCustomToast?.("Host let you in! Connecting media...", "success");
      setWpState((prev) => ({ ...prev, inLobby: false, inRoom: true }));
      initMediaAndJoinRoom();
    });

    // 🔥 C. LOBBY EVENT: Guest ko Host ne Deny kar diya
    socketService.on("LOBBY_REJECTED", () => {
      showCustomToast?.("Host denied your request to join.", "error");
      setWpState((prev) => ({
        ...prev,
        inLobby: false,
        inRoom: false,
        roomId: "",
      }));
    });

    // 🔥 D. ROOM MEDIA & PARTICIPANTS SYNC
    const initMediaAndJoinRoom = () => {
      webRtcService
        .initialize(userId, handleRemoteStream, handlePeerDisconnect)
        .then(() => {
          if (!isMounted) return;
          setLocalStream(webRtcService.localStream);
          socketService.joinRoom({
            roomId: wpState.roomId,
            userId,
            userName,
            avatar,
            isHost: wpState.isHost,
          });
        })
        .catch(() =>
          showCustomToast?.(
            "Could not initialize audio/video streams",
            "error",
          ),
        );
    };

    // Host ke liye directly room media chalu karo
    if (wpState.inRoom && wpState.isHost) {
      initMediaAndJoinRoom();
    }

    socketService.on(
      "ROOM_STATE_UPDATE",
      ({ activeMovie, isPlaying, progress, participants }) => {
        setWpState((prev) => ({
          ...prev,
          activeMovie: activeMovie || prev.activeMovie,
          isPlaying: isPlaying ?? prev.isPlaying,
          progress: progress ?? prev.progress,
          participants: participants || prev.participants,
        }));
      },
    );

    socketService.on(
      "USER_JOINED",
      ({ userId: remoteId, userName: remoteName }) => {
        showCustomToast?.(`${remoteName} joined the room!`, "success");
        webRtcService.connectToNewUser(remoteId);
        setWpState((prev) => {
          const exists = prev.participants.some((p) => p.id === remoteId);
          if (exists) return prev;
          return {
            ...prev,
            participants: [
              ...prev.participants,
              {
                id: remoteId,
                name: remoteName,
                avatar: "📱",
                isMicOn: true,
                isCamOn: true,
              },
            ],
          };
        });
      },
    );

    socketService.on("MEDIA_PLAY_SYNC", () =>
      setWpState((prev) => ({ ...prev, isPlaying: true })),
    );
    socketService.on("MEDIA_PAUSE_SYNC", () =>
      setWpState((prev) => ({ ...prev, isPlaying: false })),
    );
    socketService.on("MEDIA_SELECT_SYNC", ({ movie }) => {
      setWpState((prev) => ({
        ...prev,
        activeMovie: movie,
        progress: 0,
        isPlaying: true,
      }));
      showCustomToast?.(`${movie.title} is now playing!`, "success");
    });

    socketService.on("NEW_CHAT_MESSAGE", (msg) => {
      setWpState((prev) => ({
        ...prev,
        messages: [...prev.messages, { ...msg, isMe: msg.sender === userName }],
      }));
    });

    return () => {
      isMounted = false;
    };
  }, [
    wpState.roomId,
    wpState.inRoom,
    wpState.isHost,
    userId,
    userName,
    avatar,
    handleRemoteStream,
    handlePeerDisconnect,
    showCustomToast,
  ]);

  // =======================================================
  // 2. ACTIONS: HOST VS GUEST LOBBY CONTROLS
  // =======================================================

  // 🔥 ACTION: Host Room banata hai (Direct Entry)
  const createParty = useCallback(
    (roomId) => {
      socketService.connect(userId, userName, avatar);
      setWpState((prev) => ({
        ...prev,
        inRoom: true,
        inLobby: false,
        roomId,
        isHost: true,
        participants: [
          {
            id: userId,
            name: `${userName} (Host)`,
            avatar,
            isMicOn: true,
            isCamOn: true,
          },
        ],
      }));
    },
    [userId, userName, avatar],
  );

  // 🔥 ACTION: Guest Link se request bhejta hai (Pehle Lobby me rukega)
  const joinPartyRequest = useCallback(
    (roomId) => {
      socketService.connect(userId, userName, avatar);
      socketService.requestJoinLobby({
        roomId,
        userId,
        userName,
        avatar,
      });
      setWpState((prev) => ({
        ...prev,
        inRoom: false,
        inLobby: true,
        roomId,
        isHost: false,
      }));
    },
    [userId, userName, avatar],
  );

  // 🔥 ACTION: Host user ko Approve karta hai
  const admitParticipant = useCallback(
    (remoteUserId) => {
      socketService.admitUser(remoteUserId, wpState.roomId);
      setWpState((prev) => ({
        ...prev,
        lobbyQueue: prev.lobbyQueue.filter((u) => u.id !== remoteUserId),
      }));
    },
    [wpState.roomId],
  );

  // 🔥 ACTION: Host user ko Reject karta hai
  const denyParticipant = useCallback(
    (remoteUserId) => {
      socketService.denyUser(remoteUserId, wpState.roomId);
      setWpState((prev) => ({
        ...prev,
        lobbyQueue: prev.lobbyQueue.filter((u) => u.id !== remoteUserId),
      }));
    },
    [wpState.roomId],
  );

  const leaveParty = useCallback(() => {
    socketService.leaveRoom(wpState.roomId);
    webRtcService.cleanup();
    setLocalStream(null);
    setWpState((prev) => ({
      ...prev,
      inRoom: false,
      inLobby: false,
      roomId: "",
      isHost: false,
      activeMovie: null,
      remoteStreams: {},
      lobbyQueue: [],
    }));
  }, [wpState.roomId]);

  const selectMovie = useCallback(
    (movie) => {
      if (!wpState.isHost) {
        showCustomToast?.("Only the host can select movies", "error");
        return;
      }
      socketService.emitMovieSelect(wpState.roomId, movie);
      setWpState((prev) => ({
        ...prev,
        activeMovie: movie,
        progress: 0,
        isPlaying: true,
      }));
    },
    [wpState.isHost, wpState.roomId, showCustomToast],
  );

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      const msg = {
        id: Date.now(),
        sender: userName,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text,
        isMe: true,
        avatar,
      };
      socketService.sendMessage(wpState.roomId, msg);
      setWpState((prev) => ({
        ...prev,
        messages: [...prev.messages, msg],
        chatInput: "",
      }));
    },
    [userName, avatar, wpState.roomId],
  );

  const toggleControl = useCallback(
    async (key) => {
      if (key === "isMuted") {
        const nextState = !wpState.isMuted;
        webRtcService.toggleAudio(nextState);
        setWpState((prev) => ({ ...prev, isMuted: nextState }));
        showCustomToast?.(
          nextState ? "Microphone muted" : "Microphone unmuted",
          "success",
        );
      } else if (key === "isCamOn") {
        const nextState = !wpState.isCamOn;
        webRtcService.toggleVideo(nextState);
        setWpState((prev) => ({ ...prev, isCamOn: nextState }));
        showCustomToast?.(
          nextState ? "Camera turned on" : "Camera turned off",
          "success",
        );
      } else if (key === "isScreenSharing") {
        if (!wpState.isScreenSharing) {
          try {
            await webRtcService.startScreenShare(() =>
              setWpState((prev) => ({ ...prev, isScreenSharing: false })),
            );
            setWpState((prev) => ({ ...prev, isScreenSharing: true }));
            showCustomToast?.("Screen sharing started", "success");
          } catch (err) {
            showCustomToast?.("Could not share screen", "error");
          }
        } else {
          webRtcService.stopScreenShare();
          setWpState((prev) => ({ ...prev, isScreenSharing: false }));
          showCustomToast?.("Screen sharing stopped", "success");
        }
      } else {
        setWpState((prev) => ({ ...prev, [key]: !prev[key] }));
      }
    },
    [
      wpState.isMuted,
      wpState.isCamOn,
      wpState.isScreenSharing,
      showCustomToast,
    ],
  );

  return {
    wpState,
    setWpState,
    createParty, // 🔥 Use this for host creation
    joinPartyRequest, // 🔥 Use this for link/mobile joining
    admitParticipant, // 🔥 Admit user button action
    denyParticipant, // 🔥 Deny user button action
    leaveParty,
    selectMovie,
    sendMessage,
    toggleControl,
    localStream, // 🔥 Video tag ko safe bind karne ke liye
  };
}
