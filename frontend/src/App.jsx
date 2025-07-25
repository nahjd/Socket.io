import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://socket-io-1-p8mv.onrender.com/");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [chatType, setChatType] = useState("group");
  const [submitted, setSubmitted] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  // Socket event listeners — roomFull alert
  useEffect(() => {
    socket.on("roomFull", (msg) => {
      alert(msg);
      setSubmitted(false);
    });

    return () => {
      socket.off("roomFull");
    };
  }, []);

  // Main socket event listeners
  useEffect(() => {
    socket.on("initialMessages", (allMessages) => {
      setMessages(allMessages);
    });

    socket.on("chatMessage", (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("initialMessages");
      socket.off("chatMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  // Scroll messages into view on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", {
        roomCode,
        username,
        text: message,
      });
      setMessage("");
      socket.emit("stopTyping", { roomCode });
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim()) {
      socket.emit("joinRoom", { roomCode, username, chatType });
      setSubmitted(true);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { roomCode, username });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { roomCode });
    }, 2000);
  };

  const getColorFromName = (name) => {
    const colors = ["#e57373", "#81c784", "#64b5f6", "#ffd54f", "#ba68c8"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="chat-container">
      {!submitted ? (
        <form onSubmit={handleJoin} className="username-form">
          <h2>Çat növünü seç və daxil ol</h2>
          <div className="chat-type-buttons">
            <button
              type="button"
              className={chatType === "group" ? "selected" : ""}
              onClick={() => setChatType("group")}
            >
              Qrup Çat
            </button>
            <button
              type="button"
              className={chatType === "private" ? "selected" : ""}
              onClick={() => setChatType("private")}
            >
              Şəxsi Çat
            </button>
          </div>

          <input
            type="text"
            placeholder="Adınız"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder={`Otaq kodu (${chatType === "group" ? "Qrup" : "Şəxsi"})`}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
          />
          <button type="submit">Daxil ol</button>
        </form>
      ) : (
        <>
          <h2>
            🗨️ Otaq: {roomCode} ({chatType === "group" ? "Qrup" : "Şəxsi"})
          </h2>
          <div className="online-list">
            <strong>Online:</strong>{" "}
            {onlineUsers.map((user, i) => (
              <span key={i} className="online-user">
                {typeof user === "string" ? user : user.username || user}
              </span>
            ))}
          </div>

          <ul className="messages">
            {messages.map((msg, i) => (
              <li
                key={i}
                className={`message-bubble ${
                  msg.username === username ? "own" : ""
                }`}
              >
                <div className="profile">
                  <div
                    className="avatar"
                    style={{ backgroundColor: getColorFromName(msg.username) }}
                  >
                    {msg.username[0]?.toUpperCase()}
                  </div>
                  <div className="text">
                    <span className="username">{msg.username}</span>
                    <p>{msg.text}</p>
                    <span className="time">{msg.time}</span>
                  </div>
                </div>
              </li>
            ))}
            {typingUser && typingUser !== username && (
              <li className="typing-indicator">{typingUser} yazır...</li>
            )}
            <div ref={messagesEndRef} />
          </ul>

          <form onSubmit={sendMessage} className="form">
            <input
              type="text"
              placeholder="Mesaj yaz..."
              value={message}
              onChange={handleTyping}
              autoComplete="off"
              autoFocus
            />
            <button type="submit">Göndər</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
