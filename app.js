import 'dotenv/config'
import express from "express";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { createServer } from "http";
import cors from 'cors';
import path from "path";
import fs from 'fs';
const app = express();
const port =process.env.PORT|| 3009;
console.log(process.env.PORT)
const server = createServer(app);
let usersroom={};
const io = new Server(server,{
    cors:{
        origin:["http://localhost:3000/","https://filesharing-vert.vercel.app/"],
        methods:["GET","POSTS"],
        credentials:true
    },
    maxHttpBufferSize:1e8

});
app.use(
    cors({
      origin: ["http://localhost:3000/","https://filesharing-vert.vercel.app/"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
app.get('/',(req,res)=>{
     res.send("File Sharing Backend Services Up and Running");
})
io.on("connection",(socket)=>{
    console.log("sc",socket.id)
   socket.emit("Welcome",`Welcomesss ${socket.id}`)
   socket.on('join-room', ({roomId,name}) => {
    console.log(`Joining room: ${roomId} ${name}`);
    socket.join(roomId)
    if(usersroom[roomId]){
        let updatedroom = [...new Set([...usersroom[roomId],name])]
        usersroom[roomId] =updatedroom;
    } 
    else{
        usersroom[roomId] = [name]
    }
    console.log("usersrooms",usersroom)
    io.to(roomId).emit('join-msg',usersroom[roomId])
    socket.on('file-chunk', ({ roomId, name, type, size, totalChunks, chunkIndex, data, sender ,originalFileName}) => {
       io.to(roomId).emit("forward-filechunk",{roomId,name,type,totalChunks,chunkIndex,data,sender,originalFileName});
    });
}) 
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
      });
    
  });
  
server.listen(port,()=>{
    console.log(`Server is up and running, ${port}`)
})