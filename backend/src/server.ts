import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { UserManager } from "./managers/UserManagers.js";
const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://omegle-rk-36ut.vercel.app/",
  },
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/api/turn-credentials", async (req, res) => {
  const response = await fetch(
    `https://yogeshgurani.metered.live/api/v1/turn/credentials?apiKey=mV_ysrqRnRbbq4hM6dATE9e0sK7Q3rZhlBaiemMqlQLxAPvk`,
  );
  const iceServers = await response.json();

  res.json(iceServers);
});
const userManager = new UserManager();
io.on("connection", (socket) => {
  userManager.addUser("randomName", socket);
  socket.on("message", (sdp: string) => {});
  socket.on("disconnect", () => {
    userManager.removeUser(socket.id);
  });
});

server.listen(process.env.PORT || 3005, () => {
  console.log("listener running on http://localhost:3005");
});
