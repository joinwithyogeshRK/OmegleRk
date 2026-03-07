import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useClerk } from "@clerk/clerk-react";

const Room = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteName, setRemoteName] = useState<string>("Remote");
  const [showDropdown, setShowDropdown] = useState(false);

  const { signOut } = useClerk();
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "You";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const url = "http://localhost:3005";

  useEffect(() => {
    const socket = io(url);
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    const candidateQueue: RTCIceCandidateInit[] = [];


    const setupLocalStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      return stream;
    };


    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
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
      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate);
      } else {
        candidateQueue.push(candidate);
      }
    });

    socket.on("send-offer", async ({ roomId }) => {
      roomRef.current = roomId;
      await setupLocalStream();
      const sdp = await pc.createOffer();
      await pc.setLocalDescription(sdp);
      // ✅ Send our name along with the offer
      socket.emit("offer", { roomId, sdp, name: userName });
    });

    socket.on(
      "offer",
      async ({ sdp: remoteSdp, roomId, name: remoteUserName }) => {
        roomRef.current = roomId;
        // ✅ Save the remote user's name
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

    return () => {
      socket.disconnect();
      pc.close();
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url('/bg.avif')" }}
    >

      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-slate-900/45 to-black/65" />


      <nav
        className="relative z-20 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.3))",
              border: "1px solid rgba(148,196,255,0.2)",
            }}
          >
            🎥
          </div>
          <span
            className="text-white font-semibold text-sm tracking-wide"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Live Room
          </span>
        </div>


        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-150"
            style={{
              background: showDropdown
                ? "rgba(255,255,255,0.14)"
                : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              }}
            >
              {avatarLetter}
            </div>
            <span className="text-sm text-white/80 font-medium">
              {userName}
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
            />
            <span className="text-white/40 text-xs ml-1">
              {showDropdown ? "▲" : "▼"}
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute right-0 top-12 rounded-xl overflow-hidden"
              style={{
                background: "rgba(15,20,35,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                minWidth: 160,
                animation: "fadeDown 0.15s ease both",
              }}
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
                  Signed in as
                </p>
                <p className="text-sm text-white/80 font-semibold mt-0.5 truncate">
                  {userName}
                </p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
                className="w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150 flex items-center gap-2"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(248,113,113,0.08)")
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

      {/* Video grid */}
      <div className="relative z-10 flex items-center justify-center gap-6 h-[calc(100vh-65px)] px-8">
        {/* Local video */}
        <div className="relative group">
          <video
            ref={localVideoRef}
            className="rounded-2xl object-cover"
            style={{
              width: 420,
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            autoPlay
            playsInline
            muted
          />

          <div
            className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              }}
            >
              {avatarLetter}
            </div>
            <span className="text-white text-xs font-medium">
              {userName} (You)
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
            />
          </div>
        </div>


        <div className="relative group">
          <video
            ref={remoteVideoRef}
            className="rounded-2xl object-cover"
            style={{
              width: 420,
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            autoPlay
            playsInline
          />

          <div
            className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
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
            <span className="text-white text-xs font-medium">{remoteName}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
            />
          </div>
        </div>
      </div>

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
