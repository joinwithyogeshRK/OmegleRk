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
        console.log(`these are our users array now ${this.users}`);
        this.queue.push(socket.id);
        console.log(`after the push queue fucntion ${this.users} users and ${this.queue} queue`);
        this.clearQueue();
        console.log("after the clear queue funtion our queue is now", this.queue);
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter((x) => x.socket.id != socketId);
        this.queue = this.queue.filter((x) => x != socketId);
    }
    clearQueue() {
        console.log("entering into clear queue");
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
        socket.on("add-ice-candidate", ({ candidate, roomId, type, }) => {
            this.roomsManager.onIceCandidate(roomId, socket.id, candidate, type);
        });
    }
}
//# sourceMappingURL=UserManagers.js.map