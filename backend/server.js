const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
// app.use(express.static('public'));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

 socket.on("chatMessage", (msgObj) => {
  io.emit("chatMessage", msgObj);
});


  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server http://localhost:3000 ünvanında işləyir');
});
