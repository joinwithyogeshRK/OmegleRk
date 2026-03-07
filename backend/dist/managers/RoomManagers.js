var GlobalId = 1;
export class RoomManager {
    rooms;
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId, {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId,
        });
    }
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }
    onOffer(sdp, roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recevingUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
        recevingUser.socket?.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(sdp, roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user2.socket.id === socketId ? room.user1 : room.user2;
        recievingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onSkip(roomId, senderSocketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        recievingUser.socket.emit("peer-skipped");
        this.rooms.delete(roomId);
    }
    onIceCandidate(candidate, roomId, senderSocketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const recievingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        recievingUser.socket.emit("add-ice-candidate", {
            candidate,
        });
    }
    generate() {
        return GlobalId++;
    }
}
//# sourceMappingURL=RoomManagers.js.map