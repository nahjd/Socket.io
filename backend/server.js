const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
// app.use(express.static('public')); // frontend varsa bunu aç

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log("Yeni istifadəçi:", socket.id);

  socket.on("joinRoom", ({ roomCode, username, avatar, isGroup, chatType }) => {
    // Fərdi çatda artıq 2 nəfər varsa, daxil olmağa icazə vermə
    if (chatType === "private" && io.sockets.adapter.rooms.get(roomCode)?.size >= 2) {
      socket.emit("roomFull", "Bu şəxsi otağa artıq iki nəfər qoşulub.");
      return;
    }

    socket.join(roomCode);
    socket.data = { roomCode, username, avatar, isGroup, chatType };

    if (!rooms[roomCode]) rooms[roomCode] = [];
    if (!onlineUsers[roomCode]) onlineUsers[roomCode] = new Map();

    onlineUsers[roomCode].set(username, { id: socket.id, avatar });

    socket.emit("initialMessages", rooms[roomCode]);

    const users = Array.from(onlineUsers[roomCode], ([name, { id, avatar }]) => ({
      username: name,
      id,
      avatar
    }));
    io.to(roomCode).emit("onlineUsers", users);
  });

  socket.on("chatMessage", ({ roomCode, username, text }) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = socket.data.avatar;
    const msg = { username, text, time, avatar };

    if (rooms[roomCode].length > 100) {
      rooms[roomCode].shift(); // çox mesaj varsa ən köhnəsini sil
    }

    rooms[roomCode].push(msg);
    io.to(roomCode).emit("chatMessage", msg);
  });

  socket.on("typing", ({ roomCode, username }) => {
    socket.to(roomCode).emit("typing", username);
  });

  socket.on("stopTyping", ({ roomCode }) => {
    socket.to(roomCode).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    const { roomCode, username } = socket.data || {};
    if (roomCode && onlineUsers[roomCode]) {
      onlineUsers[roomCode].delete(username);
      const users = Array.from(onlineUsers[roomCode], ([name, { id, avatar }]) => ({
        username: name,
        id,
        avatar
      }));
      io.to(roomCode).emit("onlineUsers", users);
    }
    console.log("İstifadəçi ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} ünvanında işləyir`);
});
