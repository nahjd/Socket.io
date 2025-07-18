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
let messages = []; // Qalıcı mesajlar burda saxlanacaq

io.on('connection', (socket) => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

   // Yeni istifadəçiyə əvvəlki mesajları göndər
  socket.emit("initialMessages", messages);

socket.on("chatMessage", (msg) => {
    messages.push(msg); // Mesajı array-a əlavə et
    io.emit("chatMessage", msg); // Hamıya göndər
  });


  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server http://localhost:3000 ünvanında işləyir');
});
