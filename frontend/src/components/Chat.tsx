import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export default function ChatBox({
  socket,
  roomId,
  messages,
  setMessages,
  remoteName = "Remote",
  onClose,
}: {
  socket: Socket;
  roomId: string | null;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  remoteName?: string;
  onClose?: () => void;
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!message.trim()) return;
    socket?.emit("sendMessage", { roomId, message });
    setMessages((prev) => [
      ...prev,
      { id: Math.random(), text: message, sender: "me" },
    ]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  const remoteInitial = remoteName.charAt(0).toUpperCase();

  return (
    <div className="h-full w-full p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .chat-root * { font-family: 'DM Sans', sans-serif; }

        /* Gradient border on outer wrapper */
        .chat-gradient-border {
          position: relative;
          border-radius: 24px;
          padding: 1.5px;
          background: linear-gradient(160deg, #a3e635, #65a30d, #84cc16, #a3e635);
          background-size: 300% 300%;
          animation: borderShift 4s ease infinite;
        }
        @keyframes borderShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .chat-inner {
          border-radius: 22px;
          background: linear-gradient(170deg, #0b0f17 0%, #05070b 100%);
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Gradient border on input */
        .input-gradient-border {
          position: relative;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(135deg, #a3e635, #4ade80, #65a30d);
          background-size: 200% 200%;
          animation: borderShift 3s ease infinite;
        }
        .input-inner {
          border-radius: 14px;
          background: rgba(5, 8, 14, 0.95);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
        }

        .msg-pop { animation: msgPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes msgPop {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(163,230,53,0.25); border-radius: 99px; }

        .chat-input::placeholder { color: rgba(255,255,255,0.2); }
        .chat-input { background: transparent; outline: none; font-size: 14px; color: #fff; flex: 1; }

        .send-btn { transition: transform 0.15s, background 0.2s; }
        .send-btn:hover { transform: scale(1.1); }
        .send-btn:active { transform: scale(0.9); }

        .close-btn { transition: background 0.15s, color 0.15s; }
        .close-btn:hover { background: rgba(248,113,113,0.12) !important; color: #f87171 !important; }
      `}</style>

      {/* Gradient border wrapper */}
      <div className="chat-gradient-border chat-root h-full">
        <div className="chat-inner">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(163,230,53,0.1)" }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar — all lime, no orange */}
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #65a30d, #a3e635)",
                    color: "#0a0a0a",
                    boxShadow:
                      "0 0 0 2px rgba(163,230,53,0.3), 0 0 14px rgba(163,230,53,0.2)",
                  }}
                >
                  {remoteInitial}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    background: "#a3e635",
                    borderColor: "#0b0f17",
                    boxShadow: "0 0 7px #a3e635",
                  }}
                />
              </div>

              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  {remoteName}
                </p>
                <p className="text-xs font-medium" style={{ color: "#a3e635" }}>
                  ● online
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="close-btn w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll px-5 py-4">
            {messages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ opacity: 0.25 }}
              >
                <div style={{ fontSize: 30 }}>💬</div>
                <p className="text-white text-xs tracking-widest uppercase">
                  Say hello!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {messages.map((msg, i) => {
                  const isMe = msg.sender === "me";
                  const prevSender = i > 0 ? messages[i - 1].sender : null;
                  const isGroupStart = prevSender !== msg.sender;

                  return (
                    <div
                      key={msg.id}
                      className={`msg-pop flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${isGroupStart ? "mt-4" : "mt-0.5"}`}
                    >
                      {/* Remote avatar — lime */}
                      {!isMe && (
                        <div
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: isGroupStart
                              ? "linear-gradient(135deg, #65a30d, #a3e635)"
                              : "transparent",
                            color: "#0a0a0a",
                            visibility: isGroupStart ? "visible" : "hidden",
                            minWidth: 24,
                          }}
                        >
                          {remoteInitial}
                        </div>
                      )}

                      <div
                        className="px-4 py-2.5 text-sm leading-relaxed"
                        style={{
                          maxWidth: "75%",
                          borderRadius: isMe
                            ? "16px 16px 3px 16px"
                            : "16px 16px 16px 3px",
                          background: isMe
                            ? "linear-gradient(135deg, #65a30d, #a3e635)"
                            : "rgba(163,230,53,0.06)",
                          color: isMe ? "#0a0a0a" : "rgba(255,255,255,0.88)",
                          fontWeight: isMe ? "600" : "400",
                          boxShadow: isMe
                            ? "0 4px 18px rgba(163,230,53,0.3)"
                            : "inset 0 0 0 1px rgba(163,230,53,0.12)",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input — gradient border */}
          <div
            className="px-4 pb-4 pt-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(163,230,53,0.08)" }}
          >
            <div className="input-gradient-border">
              <div className="input-inner">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="chat-input"
                />
                <button
                  onClick={send}
                  className="send-btn flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: message.trim()
                      ? "linear-gradient(135deg, #65a30d, #a3e635)"
                      : "rgba(163,230,53,0.07)",
                    color: message.trim() ? "#0a0a0a" : "rgba(163,230,53,0.3)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <p
              className="text-center mt-2.5 text-xs"
              style={{ color: "rgba(163,230,53,0.2)" }}
            >
              Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
