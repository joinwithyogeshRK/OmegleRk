import type { User } from "./UserManagers.js";
export declare class RoomManager {
    private rooms;
    constructor();
    createRoom(user1: User, user2: User): void;
    deleteRoom(roomId: string): void;
    onOffer(sdp: string, roomId: string, socketId: string): void;
    onAnswer(sdp: string, roomId: string, socketId: string): void;
    onSkip(roomId: string, senderSocketId: string): void;
    onIceCandidate(candidate: any, roomId: string, senderSocketId: string): void;
    message(roomId: string, senderSocketId: string, message: string): void;
    generate(): number;
}
//# sourceMappingURL=RoomManagers.d.ts.map