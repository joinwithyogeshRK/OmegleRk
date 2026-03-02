import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Room = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const url = "http://localhost:3005";

  useEffect(() => {
    console.log("Room component mounted");
    const socket = io(url);
    const pc = new RTCPeerConnection();
    pc.createDataChannel("dummy");
   

    pcRef.current = pc;
    socket.on("send-offer", async ({ roomId }) => {
        pc.onicecandidate = async (e) => {
          console.log("setting up ice-candidates", e.candidate);
          if (e.candidate) {
            socket.emit("onIceCandidate", {
              candidate: e.candidate,
              type: "sender",
              roomId: roomId,
            });
          }
        };
      console.log("room id in frontend", roomId); //ok

      console.log("i recieved the send offer event"); //ok
      // const pc = new RTCPeerConnection();
      console.log("this is peer connectiuon object yes", pc);
     
      console.log("this is pc object afetr ice", pc);

      const sdp = await pc.createOffer();
      await pc.setLocalDescription(sdp);
      console.log("this is sdp generated of sender", sdp);
      socket.emit("offer", {
        roomId,
        sdp,
      });
      console.log(
        "offer is sent to the signaling server via the socket id",
        socket.id,
      );
    });
    socket.on(
      "offer",
      async ({ sdp: remoteSdp, roomId }: { sdp: any; roomId: string }) => {
        console.log(
          "actually now i recieved the offer from the signlaing server which conains the sdp and room. id i am browser 2",
        );
        // const pc = new RTCPeerConnection();
        console.log("new rtc peer connection is made");
        console.log("show me the remote sdp", remoteSdp);
        await pc.setRemoteDescription(remoteSdp);
         socket.on("add-ice-candidate", async ({ candidate, type }) => {
           if (type === "sender") {
             console.log("this is ur candidate", candidate);
             pc.addIceCandidate(candidate);
           }
         });

      
        const sdp = await pc.createAnswer();
        console.log("this is peer connectiuon object", pc);

        await pc.setLocalDescription(sdp);
        socket.emit("answer", {
          roomId,
          sdp,
        });
        console.log("answer is sent back tot he user 1 with the id", socket.id);
      },
    );
    socket.on("answer", async ({ sdp, roomId }) => {
      console.log("sdp inside answer", sdp);
      const pc = pcRef.current!;
      await pc.setRemoteDescription(sdp);
       socket.on("add-ice-candidate", async ({ candidate, type }) => {
         if (type === "reciever") {
           console.log("this is ur candidate", candidate);
           pc.addIceCandidate(candidate);
         }
       });
      console.log(
        "answer is set in remote and local description for the user 2 with the socket id is ",
        socket.id,
      );
    });
    
  }, []);
  return (
    <div>
      hey hello may be now connection is working good see the console in
      development tools
    </div>
  );
};

export default Room;
