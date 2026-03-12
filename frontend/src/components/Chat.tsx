import { useState } from "react";
import { Socket } from "socket.io-client";

export default function ChatBox({socket , roomId}:{socket:Socket , roomId:string}) {
  const [message, setMessage] = useState("");
console.log("chat page credentials",socket , roomId);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! How are you?", sender: "remote" },
    { id: 2, text: "I'm good, working on WebRTC.", sender: "me" },
    { id: 3, text: "Nice! That’s cool.", sender: "remote" },
  ]);
  const send = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Math.random(),
      text: message,
      sender: "me",
    };

    //@ts-ignore
    setMessages((prev)=>[...prev,newMessage]);
    console.log("message array", messages);
    setMessage("")
  };

  return (
    <div className="h-full  w-full">
      <div className="border-3 h-full  rounded-4xl border-lime-400 bg-gradient-to-b from-[#0b0f17] to-[#05070b] flex flex-col overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.25)]">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b  border-white/10">
          <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center font-bold text-black">
            U
          </div>

          <div className="flex flex-col">
            <span className="text-white font-medium">User</span>
            <span className="text-lime-400 text-xs">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-full text-sm max-w-[70%] ${
                  msg.sender === "me"
                    ? "bg-lime-400 text-black"
                    : "bg-[#2a2f3a] text-gray-300"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t  border-white/10">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-full px-4 py-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
            />
            //@ts-ignore
            <button
              onClick={send}
              className="bg-lime-600 hover:bg-lime-400 text-black px-5 py-2 rounded-full font-semibold transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
