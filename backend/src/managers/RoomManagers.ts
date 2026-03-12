import type { User } from "./UserManagers.js";

interface Room {
  user1: User;
  user2: User;
}
var GlobalId = 1;
export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }
  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId, {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });
  }
  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }
  onOffer(sdp: string, roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const recevingUser =
      room.user1.socket.id === socketId ? room.user2 : room.user1;

    recevingUser.socket?.emit("offer", {
      sdp,
      roomId,
    });
  }
  onAnswer(sdp: string, roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const recievingUser =
      room.user2.socket.id === socketId ? room.user1 : room.user2;
    recievingUser.socket.emit("answer", {
      sdp,
      roomId,
    });
  }
  onSkip(roomId: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }
    const recievingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recievingUser.socket.emit("peer-skipped");
    this.rooms.delete(roomId);
  }
  onIceCandidate(candidate: any, roomId: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const recievingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    recievingUser.socket.emit("add-ice-candidate", {
      candidate,
    });
  }
  message(roomId: string, senderSocketId: string , message:string) {
     const room = this.rooms.get(roomId);

     if (!room) {
       return;
     }
     console.log("hello i am on message",message)

     const recievingUser =
       room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

     recievingUser.socket.emit("getMessage", {
       message,
     });
  }
  generate() {
    return GlobalId++;
  }
}
