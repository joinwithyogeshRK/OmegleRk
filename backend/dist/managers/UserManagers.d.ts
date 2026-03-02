import { Socket } from "socket.io";
export interface User {
    name: string;
    socket: Socket;
}
export declare class UserManager {
    private users;
    private queue;
    private roomsManager;
    constructor();
    addUser(name: string, socket: Socket): void;
    removeUser(socketId: string): void;
    clearQueue(): void;
    initHandlers(socket: Socket): void;
}
//# sourceMappingURL=UserManagers.d.ts.map