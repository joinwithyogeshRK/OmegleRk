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
   console.log("now i am creating the room")
    const roomId = this.generate().toString();
    this.rooms.set(roomId, {
      user1,
      user2,
    });
    console.log("room is created with the id" , roomId)
    console.log("now our rooms are" , this.rooms)
     console.log("room id is for check", roomId)
    user1.socket.emit("send-offer", {
      roomId
    });
    console.log("user1 has intilaised the offer with the socket id" , user1.socket.id)
  }
  deleteRoom(roomId:string){
     this.rooms.delete(roomId)
  }
  onOffer(sdp: string, roomId: string, socketId: string) {
    console.log("this si our sdp",sdp)
    console.log("this is room id",roomId)
    console.log("i got the request from forntend")
    const room = this.rooms.get(roomId);
console.log("room id is set")
console.log("our rooms inside on offer",this.rooms);
    if(!room){
        return;
    }
    console.log("reached here")
     const recevingUser = (room.user1.socket.id === socketId ? room.user2 : room.user1)
     console.log("i am gonna emit the answer to the forntend")
     recevingUser.socket?.emit('offer',{
        sdp,roomId
     })
     console.log("i am passing sdp to the user 2 with the id",recevingUser.socket.id)
  }
  onAnswer(sdp: string, roomId: string, socketId: string) {

    const room = this.rooms.get(roomId);
    if(!room){
        return;
    }
    const recievingUser = (room.user2.socket.id === socketId ? room.user1 : room.user2)
    recievingUser.socket.emit('answer',{
            sdp,roomId
    }) 
    console.log("i am recieving the answer with the socket id is",recievingUser.socket.id)
  }
  onIceCandidate(
    senderSocketId:string,
    roomId: string,
    candidate: any,
    type: "sender" | "reciever",
  ) {
const room = this.rooms.get(roomId);
if(!room){
    return;
}
const recievingUser = (room.user1.socket.id === senderSocketId ? room.user2 : room.user1);
recievingUser.socket.emit('add-ice-candidate',{
    candidate , type
})
  }
  generate() {
    return GlobalId++;
  }
}
