import { Socket } from "socket.io";
import { RoomManager } from "./RoomManagers.js";
export class UserManager {
    users;
    queue;
    roomsManager;
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomsManager = new RoomManager();
    }
    addUser(name, socket) {
        console.log(`user with the ${socket.id} came`);
        this.users.push({
            name,
            socket,
        });
        this.queue.push(socket.id);
        this.clearQueue();
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter((x) => x.socket.id != socketId);
        this.queue = this.queue.filter((x) => x != socketId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        const user1 = this.users.find((user) => user.socket.id === id1);
        const user2 = this.users.find((user) => user.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        this.roomsManager.createRoom(user1, user2);
        this.clearQueue();
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomsManager.onOffer(sdp, roomId, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomsManager.onAnswer(sdp, roomId, socket.id);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId }) => {
            this.roomsManager.onIceCandidate(candidate, roomId, socket.id);
        });
        socket.on("skip", ({ roomId }) => {
            this.roomsManager.onSkip(roomId, socket.id);
        });
        socket.on("sendMessage", ({ roomId, message }) => {
            console.log("here the evnt is fired in user manager");
            this.roomsManager.message(roomId, socket.id, message);
        });
    }
}
//# sourceMappingURL=UserManagers.js.map