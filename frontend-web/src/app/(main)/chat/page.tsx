"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Users, Dumbbell } from "lucide-react";

interface ChatMessage {
  type: "message" | "system" | "history";
  user_id?: string;
  display_name?: string;
  content: string;
  created_at: string;
  messages?: ChatMessage[];
}

const MOCK_USER_ID = "mock-user-1";
const MOCK_DISPLAY_NAME = "You (Chidi)";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE = API_BASE.replace(/^http/, "ws");

function getChannelName(): string {
  if (typeof window === "undefined") return "general";
  const today = new Date();
  return `challenge-${today.toISOString().slice(0, 10)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem("fitnaija-access-token") || "mock-token";
    const channel = getChannelName();
    const ws = new WebSocket(`${WS_BASE}/chat/ws?token=${token}&channel=${channel}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000);
    };
    ws.onmessage = (event) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        if (data.type === "history" && data.messages) {
          setMessages(data.messages);
        } else if (data.type === "system") {
          setMessages(prev => [...prev, data]);
        } else {
          setMessages(prev => [...prev, data]);
        }
      } catch {}
    };
    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      content: input.trim(),
      display_name: MOCK_DISPLAY_NAME,
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      setMessages(prev => [...prev, {
        type: "message",
        user_id: MOCK_USER_ID,
        display_name: MOCK_DISPLAY_NAME,
        content: input.trim(),
        created_at: new Date().toISOString(),
      }]);
    }
    setInput("");
  }, [input]);

  const isOwn = (userId?: string) => userId === MOCK_USER_ID;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Live Chat</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-rose-400"}`} />
              {connected ? "Connected" : "Reconnecting..."}
              <Users className="w-3 h-3 ml-2 text-slate-400" />
              {onlineCount} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold border border-emerald-200/50">
          <Dumbbell className="w-3.5 h-3.5" />
          {getChannelName()}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            if (msg.type === "system") {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2"
                >
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                    {msg.content}
                  </span>
                </motion.div>
              );
            }
            const own = isOwn(msg.user_id);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: own ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${own ? "order-1" : "order-1"}`}>
                  {!own && (
                    <p className="text-[11px] text-slate-400 font-semibold mb-1 ml-1">
                      {msg.display_name || "Anonymous"}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      own
                        ? "gradient-brand text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-0.5 ${own ? "text-right mr-1" : "ml-1"}`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={connected ? "Type a message..." : "Offline - typing locally..."}
          className="input-field flex-1"
          autoFocus
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!input.trim()}
          className="btn-primary w-11 h-11 p-0 flex items-center justify-center rounded-xl disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
}
