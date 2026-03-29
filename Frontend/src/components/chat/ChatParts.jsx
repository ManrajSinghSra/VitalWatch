// src/components/chat/ChatParts.jsx

function Bold({ text }) {
  return (
    <>
      {text.split(/\*\*(.*?)\*\*/g).map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p
      )}
    </>
  );
}

function RiskCard({ card }) {
  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
      
      <p className="text-xs font-bold text-cyan-700 mb-3">
        {card.title}
      </p>

      {card.risks.map(r => (
        <div key={r.label} className="flex items-center gap-3 mb-2 last:mb-0">
          
          <span className="text-xs text-slate-600 w-20 flex-shrink-0">
            {r.label}
          </span>

          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${r.bar}`}
              style={{ width: `${r.val}%` }}
            />
          </div>

          <span className="text-xs font-bold text-slate-700 w-7 text-right">
            {r.val}%
          </span>

        </div>
      ))}
    </div>
  );
}

export function MessageBubble({ role, content, card, timestamp }) {
  const isBot = role === "bot";

  return (
    <div
      className={`flex gap-2.5 max-w-[86%] animate-msgIn ${
        isBot ? "self-start" : "self-end flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      <div
        className={`
          w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm
          ${
            isBot
              ? "bg-cyan-100 border border-cyan-200"
              : "bg-orange-100 border border-orange-200"
          }
        `}
      >
        {isBot ? "🤖" : "👤"}
      </div>

      <div>
        {/* Bubble */}
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${
              isBot
                ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                : "bg-cyan-500 text-white rounded-tr-sm"
            }
          `}
        >
          {content.split("\n").map((line, i, arr) => (
            <span key={i}>
              <Bold text={line} />
              {i < arr.length - 1 && <br />}
            </span>
          ))}

          {card && <RiskCard card={card} />}
        </div>

        {/* Timestamp */}
        <p
          className={`text-xs text-slate-500 mt-1 ${
            isBot ? "text-left" : "text-right"
          }`}
        >
          {isBot ? "Vita · " : ""}
          {timestamp}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 self-start animate-msgIn">
      
      {/* Avatar */}
      <div className="w-7 h-7 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-sm">
        🤖
      </div>

      {/* Bubble */}
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm">
        
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block animate-bounce3"
              style={{ animationDelay: `${i * 0.2}s` }}
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
    <div className="px-4 pt-3 flex gap-2 flex-wrap">
      {questions.map(q => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="
            px-3 py-1.5 rounded-full text-xs font-medium
            bg-slate-100 text-slate-700
            border border-slate-200
            hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700
            transition-all duration-150 whitespace-nowrap
          "
        >
          {q}
        </button>
      ))}
    </div>
  );
}