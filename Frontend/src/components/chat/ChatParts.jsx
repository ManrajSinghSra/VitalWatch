const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:6001";

// Inject cursor animation styles
const cursorStyle = `
@keyframes vw-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
.vw-cursor { display: inline-block; width: 7px; height: 14px; background: currentColor; margin-left: 2px; vertical-align: text-bottom; animation: vw-blink 1s step-end infinite; }
`;

// Inject once
if (typeof document !== "undefined" && !document.getElementById("vw-stream-cursor")) {
  const s = document.createElement("style");
  s.id = "vw-stream-cursor";
  s.textContent = cursorStyle;
  document.head.appendChild(s);
}

export function SourceChips({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  // Dedupe by reportId so we don't show the same PDF multiple times.
  // Aggregation-mode sources don't have reportId — skip them.
  const uniqueSources = [];
  const seen = new Set();
  for (const s of sources) {
    if (!s.reportId) continue;
    if (seen.has(s.reportId)) continue;
    seen.add(s.reportId);
    uniqueSources.push(s);
  }

  if (uniqueSources.length === 0) return null;

  const handleOpen = (reportId) => {
    window.open(`${API_BASE}/report/download/${reportId}`, "_blank");
  };

  return (
    <div className="mt-2.5 flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Sources ({uniqueSources.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {uniqueSources.map((s, i) => (
          <button
            key={`${s.reportId}-${i}`}
            onClick={() => handleOpen(s.reportId)}
            className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
            title={`Open report — week ${s.week}/${s.year}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            <span className="font-medium">{s.disease || "Outbreak"}</span>
            {s.location && <span className="text-slate-500">· {s.location}</span>}
            {s.week && <span className="text-slate-400">· Wk {s.week}</span>}
            <svg className="h-3 w-3 text-slate-400 transition group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function Bold({ text }) {
  return (
    <>
      {text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-slate-900">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

function RiskCard({ card }) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-bold text-cyan-700">
        {card.title}
      </p>

      {card.risks.map((risk) => (
        <div key={risk.label} className="mb-2 flex items-center gap-3 last:mb-0">
          <span className="w-20 flex-shrink-0 text-xs text-slate-600">
            {risk.label}
          </span>

          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${risk.bar}`}
              style={{ width: `${risk.val}%` }}
            />
          </div>

          <span className="w-7 text-right text-xs font-bold text-slate-700">
            {risk.val}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function MessageBubble(message) {
  const { role, content, card, timestamp, isStreaming } = message;
  const isBot = role === "bot";

  return (
    <div
      className={`flex max-w-[86%] gap-2.5 animate-msgIn ${
        isBot ? "self-start" : "self-end flex-row-reverse"
      }`}
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm ${
          isBot
            ? "border border-cyan-200 bg-cyan-100"
            : "border border-orange-200 bg-orange-100"
        }`}
      >
        {isBot ? "👨‍⚕️" : "👤"}
      </div>

      <div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isBot
              ? "rounded-tl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
              : "rounded-tr-sm bg-cyan-500 text-white"
          }`}
        >
          <div className="whitespace-pre-wrap">
            {content.split("\n").map((line, index, arr) => (
              <span key={index}>
                <Bold text={line} />
                {index < arr.length - 1 && <br />}
              </span>
            ))}
            {isStreaming && <span className="vw-cursor" />}
          </div>

          {card && <RiskCard card={card} />}
          {isBot && message.sources && <SourceChips sources={message.sources} />}
        </div>

        <p className={`mt-1 text-xs text-slate-500 ${isBot ? "text-left" : "text-right"}`}>
          {isBot ? "Mr.Vital · " : ""}
          {timestamp}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex self-start gap-2.5 animate-msgIn">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-100 text-sm">
        👨‍⚕️
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex h-4 items-center gap-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="inline-block h-1.5 w-1.5 animate-bounce3 rounded-full bg-slate-400"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuickPills({ questions, onSelect, visible }) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3">
      {questions.map((question) => (
        <button
          key={question}
          onClick={() => onSelect(question)}
          className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
