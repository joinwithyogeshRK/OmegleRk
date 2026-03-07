import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const Room = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null >(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null > (null);
  console.log(localVideoRef)


  const url = "http://localhost:3005";

  useEffect(() => {

    const socket = io(url);
    const pc = new RTCPeerConnection();

    pcRef.current = pc;
    const setupLocalStream = async() => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
      });
      console.log(stream,"stream")
      stream.getTracks().forEach(track => {
        console.log("tracks",track);
        console.log("stream",stream)
          pc.addTrack(track, stream)
      });
      console.log("check tracks",stream.getTracks())
      console.log("see",localVideoRef,localVideoRef.current)
      if(localVideoRef.current){
           localVideoRef.current.srcObject = stream;
      }
      return stream;
    }
    pc.ontrack = (event) => {
      if(remoteVideoRef.current){
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    }
    console.log(pc);
    // pc.createDataChannel("dummy");

    pc.onicecandidate = (event) => {

      if (event.candidate && roomRef.current) {
        
        socket.emit("add-ice-candidate", {
          candidate: event.candidate,
          roomId: roomRef.current,
        });
        console.log(roomRef.current)
      }
    };
    const candidateQueue: RTCIceCandidateInit[] = [];

    socket.on("add-ice-candidate", async ({ candidate }) => {

      if (pc.remoteDescription) {

        await pc.addIceCandidate(candidate);
      } else {

        candidateQueue.push(candidate);
      }
    });

    socket.on("send-offer", async ({ roomId }) => {
      const channel = pc.createDataChannel("chat");
      roomRef.current = roomId;

      // const pc = new RTCPeerConnection();
       await setupLocalStream();
      const sdp = await pc.createOffer();
      await pc.setLocalDescription(sdp);

      socket.emit("offer", {
        roomId,
        sdp,
      });
    });
    socket.on(
      "offer",
      async ({ sdp: remoteSdp, roomId }: { sdp: any; roomId: string }) => {
        roomRef.current = roomId;

        // const pc = new RTCPeerConnection();

        await pc.setRemoteDescription(remoteSdp);

        for (const c of candidateQueue) {
          try {
            await pc.addIceCandidate(c);
          } catch (err) {
            console.error("Failed to add ICE candidate", err);
          }
        }

        candidateQueue.length = 0;
        await setupLocalStream();
        const sdp = await pc.createAnswer();

        await pc.setLocalDescription(sdp);
        socket.emit("answer", {
          roomId,
          sdp,
        });
      },
    );
    socket.on("answer", async ({ sdp, roomId }) => {
      const pc = pcRef.current!;
      await pc.setRemoteDescription(sdp);

      pc.ondatachannel = (event) => {
        const channel = event.channel;
      };
      for (const c of candidateQueue) {
        try {
          await pc.addIceCandidate(c);
        } catch (err) {
          console.error("Failed to add ICE candidate", err);
        }
      }

      candidateQueue.length = 0;
    });
  }, []);
  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <video
          ref={localVideoRef}
          style={{ width: 320, background: "#000" }}
          autoPlay
          playsInline
          muted
        />

        <video
          ref={remoteVideoRef}
          style={{ width: 320, background: "#000" }}
          autoPlay
          playsInline
          muted
        />
      </div>
    </div>
  );
};

export default Room;
