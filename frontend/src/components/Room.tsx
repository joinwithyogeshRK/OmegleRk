import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useClerk } from "@clerk/clerk-react";
import ChatComponent from "./Chat";

const Room = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteName, setRemoteName] = useState<string>("Remote");
  const [showDropdown, setShowDropdown] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  const { signOut } = useClerk();
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "You";
  const avatarLetter = userName.charAt(0).toUpperCase();
  const socketRef = useRef<any>(null);

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3005";

  const handleSkip = () => {
    socketRef.current?.emit("skip", { roomId: roomRef.current });
    window.location.reload();
  };

  useEffect(() => {
    const init = async () => {
      let iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
      try {
        const res = await fetch(`${url}/api/turn-credentials`);
        const turnServers = await res.json();
        iceServers = [...iceServers, ...turnServers];
      } catch (err) {
        console.error("Failed to fetch TURN credentials, using STUN only", err);
      }

      const socket = io(url);
      socketRef.current = socket;
      setSocket(socket);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      const candidateQueue: RTCIceCandidateInit[] = [];

      const setupLocalStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          return stream;
        } catch (err: any) {
          console.error("getUserMedia error:", err.name, err.message);
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = event.streams[0];
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && roomRef.current) {
          socket.emit("add-ice-candidate", {
            candidate: event.candidate,
            roomId: roomRef.current,
          });
        }
      };

      socket.on("add-ice-candidate", async ({ candidate }) => {
        if (pc.remoteDescription) await pc.addIceCandidate(candidate);
        else candidateQueue.push(candidate);
      });

      // Always-active listener
      socket.on("getMessage", ({ message }: { message: string }) => {
        setMessages((prev) => [
          ...prev,
          { id: Math.random(), text: message, sender: "remote" },
        ]);
        setShowChat((open) => {
          if (!open) setUnread((u) => u + 1);
          return open;
        });
      });

      socket.on("send-offer", async ({ roomId }) => {
        roomRef.current = roomId;
        setRoomId(roomId);
        await setupLocalStream();
        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        socket.emit("offer", { roomId, sdp, name: userName });
      });

      socket.on(
        "offer",
        async ({ sdp: remoteSdp, roomId, name: remoteUserName }) => {
          roomRef.current = roomId;
          setRoomId(roomId);
          if (remoteUserName) setRemoteName(remoteUserName);
          await setupLocalStream();
          await pc.setRemoteDescription(remoteSdp);
          for (const c of candidateQueue) {
            try {
              await pc.addIceCandidate(c);
            } catch (err) {
              console.error(err);
            }
          }
          candidateQueue.length = 0;
          const sdp = await pc.createAnswer();
          await pc.setLocalDescription(sdp);
          socket.emit("answer", { roomId, sdp, name: userName });
        },
      );

      socket.on("answer", async ({ sdp, name: remoteUserName }) => {
        if (remoteUserName) setRemoteName(remoteUserName);
        await pcRef.current!.setRemoteDescription(sdp);
        for (const c of candidateQueue) {
          try {
            await pcRef.current!.addIceCandidate(c);
          } catch (err) {
            console.error(err);
          }
        }
        candidateQueue.length = 0;
      });

      socket.on("peer-skipped", () => window.location.reload());

      return () => {
        socket.disconnect();
        pc.close();
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      cleanup = fn;
    });
    return () => {
      cleanup?.();
    };
  }, []);

  const openChat = () => {
    setShowChat(true);
    setUnread(0);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url('/bg.avif')" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInPanel {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .chat-panel  { animation: slideInPanel 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .badge-pop   { animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        .fab:hover   { transform: translateY(-3px) scale(1.06); box-shadow: 0 14px 36px rgba(163,230,53,0.5) !important; }
        .fab         { transition: transform 0.2s, box-shadow 0.2s; }
        .video-card  { transition: box-shadow 0.3s; }
        .video-card:hover { box-shadow: 0 0 0 2px rgba(163,230,53,0.4), 0 32px 80px rgba(0,0,0,0.7) !important; }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70" />

      {/* Navbar */}
      <nav
        className="relative z-20 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(163,230,53,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{
              background:
                "linear-gradient(135deg, rgba(163,230,53,0.2), rgba(74,222,128,0.15))",
              border: "1px solid rgba(163,230,53,0.25)",
            }}
          >
            🎥
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            Live Room
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-150"
            style={{
              background: showDropdown
                ? "rgba(163,230,53,0.1)"
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${showDropdown ? "rgba(163,230,53,0.3)" : "rgba(255,255,255,0.1)"}`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
              style={{
                background: "linear-gradient(135deg, #a3e635, #65a30d)",
              }}
            >
              {avatarLetter}
            </div>
            <span className="text-sm text-white/80 font-medium">
              {userName}
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#a3e635", boxShadow: "0 0 6px #a3e635" }}
            />
            <span className="text-white/40 text-xs ml-1">
              {showDropdown ? "▲" : "▼"}
            </span>
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 top-12 rounded-xl overflow-hidden z-50"
              style={{
                background: "rgba(10,14,24,0.98)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(163,230,53,0.15)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                minWidth: 160,
                animation: "fadeDown 0.15s ease both",
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "rgba(163,230,53,0.08)" }}
              >
                <p className="text-xs text-white/35 font-medium uppercase tracking-widest">
                  Signed in as
                </p>
                <p className="text-sm text-white/80 font-semibold mt-0.5 truncate">
                  {userName}
                </p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
                className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors duration-150"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(248,113,113,0.07)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>→</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main content — videos + chat side by side */}
      <div className="relative z-10 flex h-[calc(100vh-65px)]">
        {/* Video area — takes remaining space */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 p-6"
          style={{ transition: "all 0.25s ease" }}
        >
          {/* 2-column video grid */}
          <div
            className="grid grid-cols-2 gap-4 w-full"
            style={{ maxWidth: showChat ? 760 : 1100 }}
          >
            {/* Local video */}
            <div
              className="video-card relative rounded-2xl overflow-hidden"
              style={{
                boxShadow:
                  "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                aspectRatio: "16/10",
              }}
            >
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                autoPlay
                playsInline
                muted
              />
              {/* Label */}
              <div
                className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(163,230,53,0.2)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{
                    background: "linear-gradient(135deg, #a3e635, #65a30d)",
                  }}
                >
                  {avatarLetter}
                </div>
                <span className="text-white text-xs font-medium">
                  {userName}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#a3e635",
                    boxShadow: "0 0 5px #a3e635",
                  }}
                />
              </div>
              {/* YOU badge */}
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(163,230,53,0.15)",
                  color: "#a3e635",
                  border: "1px solid rgba(163,230,53,0.3)",
                }}
              >
                YOU
              </div>
            </div>

            {/* Remote video */}
            <div
              className="video-card relative rounded-2xl overflow-hidden"
              style={{
                boxShadow:
                  "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                aspectRatio: "16/10",
              }}
            >
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div
                className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  }}
                >
                  {remoteName.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium">
                  {remoteName}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#a3e635",
                    boxShadow: "0 0 5px #a3e635",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Skip button */}
          <button
            className="flex items-center gap-2 px-10 py-3 rounded-full font-semibold text-sm tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #65a30d, #a3e635)",
              color: "#0a0a0a",
              border: "1px solid rgba(163,230,53,0.3)",
              boxShadow: "0 6px 24px rgba(163,230,53,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 12px 32px rgba(163,230,53,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(163,230,53,0.3)";
            }}
            onClick={handleSkip}
          >
            ⏭ Skip
          </button>
        </div>

        {/* Chat panel — slides in alongside videos */}
        {showChat && (
          <div
            className="chat-panel flex-shrink-0 h-full"
            style={{
              width: "380px",
              background: "rgba(7,10,18,0.95)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(163,230,53,0.15)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
            }}
          >
            <ChatComponent
              socket={socket}
              roomId={roomId}
              messages={messages}
              setMessages={setMessages}
              remoteName={remoteName}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Floating Chat FAB — bottom right */}
      {!showChat && (
        <button
          onClick={openChat}
          className="fab fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #65a30d, #a3e635)",
            color: "#0a0a0a",
            border: "1px solid rgba(163,230,53,0.4)",
            boxShadow: "0 8px 28px rgba(163,230,53,0.4)",
          }}
        >
          💬 Chat
          {unread > 0 && (
            <span
              className="badge-pop w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#0a0a0a", color: "#a3e635" }}
            >
              {unread}
            </span>
          )}
        </button>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Room;
