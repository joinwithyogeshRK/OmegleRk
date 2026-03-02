import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors';
import { UserManager } from "./managers/UserManagers.js";
const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});
app.get("/", (req, res) => {
    res.send("Hello World!");
});
const userManager = new UserManager();
io.on("connection", (socket) => {
    console.log("a user connected");
    console.log(`user with the socket's id ${socket.id} came`);
    userManager.addUser("randomName", socket);
    socket.on("message", (sdp) => {
        console.log("here is the sdp", sdp);
    });
    socket.on("disconnect", () => {
        userManager.removeUser(socket.id);
        console.log("user disconnected");
    });
});
server.listen(process.env.PORT || 3005, () => {
    console.log("listener running on http://localhost:3005");
});
//# sourceMappingURL=server.js.map