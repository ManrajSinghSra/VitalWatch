import { useState, useRef, useEffect } from "react";
import { MessageBubble, TypingIndicator, QuickPills } from "./ChatParts";
import { getBotResponse, QUICK_QUESTIONS } from "../../data/mockData";
import { IconBtn } from "../ui";

const delay = ms => new Promise(r => setTimeout(r, ms));
const fmt = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME = {
  id: 0,
  role: "bot",
  timestamp: "",
  content:
    "👋 Hi! I'm **Vita**, your AI health assistant.\n\nI monitor real-time data from **IDSP, WHO, and NCDC**.\n\nHow can I help you?",
};

export default function ChatWindow() {
  const [messages, setMessages] = useState([{ ...WELCOME, timestamp: fmt() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pills, setPills] = useState(true);

  const endRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addMsg = (role, content) =>
    setMessages(p => [...p, { id: Date.now(), role, content, timestamp: fmt() }]);

  const send = async (text) => {
    if (!text.trim()) return;
    setInput("");
    setPills(false);

    addMsg("user", text);
    setTyping(true);

    await delay(800);
    const resp = getBotResponse(text);

    setTyping(false);
    addMsg("bot", resp.text);
  };

  const handleKey = e => {
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
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
         style={{ height: "calc(100vh - 200px)", minHeight: 520 }}>

      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center">
            🤖
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Vita AI</p>
            <p className="text-xs text-emerald-600">● Online</p>
          </div>
        </div>

        <div className="flex gap-2">
          <IconBtn onClick={clearChat}>🗑️</IconBtn>
          <IconBtn>📤</IconBtn>
          <IconBtn>⚙️</IconBtn>
        </div>
      </div>

      {/* Pills */}
      <QuickPills
        questions={QUICK_QUESTIONS}
        onSelect={t => setInput(t)}
        visible={pills}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-slate-50">
        {messages.map(m => <MessageBubble key={m.id} {...m} />)}
        {typing && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white">

        <div className="flex items-end gap-2 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-cyan-500">

          <textarea
            ref={textRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about disease outbreaks…"
            className="flex-1 bg-transparent outline-none resize-none text-slate-800 text-sm placeholder-slate-400"
          />

          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 disabled:opacity-40"
          >
            ➤
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-2">
          Based on IDSP · WHO · NCDC · Not a diagnostic tool
        </p>

      </div>
    </div>
  );
}