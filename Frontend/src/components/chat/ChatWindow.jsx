import { useEffect, useRef, useState } from "react";
import { MessageBubble, TypingIndicator, QuickPills } from "./ChatParts";
import { IconBtn } from "../ui";

const CHAT_API_URL = "http://localhost:6001/chat/message";
const QUICK_QUESTIONS = [
  "What do the uploaded reports say?",
  "Which diseases are mentioned?",
  "Summarize latest report",
  "What precautions are listed?",
  "Any outbreak by location?",
];
const fmt = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME = {
  id: 0,
  role: "bot",
  timestamp: "",
  content:
    "Hi! I'm **Mr.Vital**, your healthcare assistant.\n\nI can help with symptoms awareness, prevention tips, outbreak questions, and general healthcare guidance.\n\nHow can I help you today?",
};

export default function ChatWindow() {
  const [messages, setMessages] = useState([{ ...WELCOME, timestamp: fmt() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pills, setPills] = useState(true);

  const messagesRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const addMsg = (role, content) =>
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, content, timestamp: fmt() }]);

  const buildHistory = () =>
    messages.map(({ role, content }) => ({
      role,
      content,
    }));

  const send = async (text) => {
    if (!text.trim()) return;

    const history = buildHistory();

    setInput("");
    setPills(false);
    addMsg("user", text);
    setTyping(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      const data = await response.json();
      setTyping(false);

      if (!response.ok) {
        addMsg("bot", data?.message || "Mr.Vital could not find an answer from uploaded reports right now.");
        return;
      }

      // Attach sources array to the bot message so UI can render SourceChips
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: "bot",
        content: data?.reply || data?.answer || "Mr.Vital could not generate a response right now.",
        timestamp: fmt(),
        sources: data.sources || [],
      }]);
    } catch {
      setTyping(false);
      addMsg("bot", "Mr.Vital could not connect to the report knowledge base right now.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: fmt() }]);
    setPills(true);
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/88 shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
      style={{ height: "calc(100vh - 200px)", minHeight: 520 }}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-100">
            👨‍⚕️
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Mr.Vital</p>
            <p className="text-xs text-emerald-600">● Online</p>
          </div>
        </div>

        <div className="flex gap-2">
          <IconBtn onClick={clearChat}>🗑️</IconBtn>
          <IconBtn>📤</IconBtn>
          <IconBtn>⚙️</IconBtn>
        </div>
      </div>

      <QuickPills
        questions={QUICK_QUESTIONS}
        onSelect={(text) => setInput(text)}
        visible={pills}
      />

      <div
        ref={messagesRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50/72 px-5 py-4"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
        {typing && <TypingIndicator />}
      </div>

      <div className="border-t border-slate-200/80 bg-white/76 px-5 py-4">
        <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-cyan-500">
          <textarea
            ref={textRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about symptoms, prevention, outbreaks, or healthcare..."
            className="flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400"
          />

          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-40"
          >
            ➤
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Healthcare guidance only · Not a diagnostic tool
        </p>
      </div>
    </div>
  );
}
