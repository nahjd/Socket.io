import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://socket-io-1-p8mv.onrender.com/");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket.on("chatMessage", (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", {
        username,
        text: message,
      });
      setMessage("");
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="chat-container">
      {!submitted ? (
        <form onSubmit={handleUsernameSubmit} className="username-form">
          <h2>Adınızı daxil edin</h2>
          <input
            type="text"
            placeholder="Adinizi giriniz"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Daxil ol</button>
        </form>
      ) : (
        <>
          <h2>💬 Qrup Çat</h2>
          <ul className="messages">
            {messages.map((msg, i) => (
              <li key={i}>
                <strong>{msg.username}:</strong> {msg.text}
              </li>
            ))}
          </ul>
          <form onSubmit={sendMessage} className="form">
            <input
              type="text"
              placeholder="Mesaj yaz..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Göndər</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
