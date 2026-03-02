import type { User } from "./UserManagers.js";
export declare class RoomManager {
    private rooms;
    constructor();
    createRoom(user1: User, user2: User): void;
    deleteRoom(roomId: string): void;
    onOffer(sdp: string, roomId: string, socketId: string): void;
    onAnswer(sdp: string, roomId: string, socketId: string): void;
    onIceCandidate(senderSocketId: string, roomId: string, candidate: any, type: "sender" | "reciever"): void;
    generate(): number;
}
//# sourceMappingURL=RoomManagers.d.ts.map