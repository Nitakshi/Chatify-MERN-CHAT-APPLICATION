import {Server} from "socket.io";
import http from "http";
import express from "express";
import {ENV} from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    }
});

//apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

//to check if user is online or not
export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

//this is for storing online users
const userSocketMap = {}; //store value in the form of {userId: socketId}

io.on("connection", (socket) => {
    // console.log("A user is connected", socket.user.fullName);
   const userId = socket.userId;
   userSocketMap[userId] = socket.id;

   //broadcast message to all connected clients
   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   //with socket.on we listen for events from clients
   socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
   });

});

export {io, app,server};