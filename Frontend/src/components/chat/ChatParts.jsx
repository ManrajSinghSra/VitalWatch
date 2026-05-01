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

export function MessageBubble({ role, content, card, timestamp }) {
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
          {content.split("\n").map((line, index, arr) => (
            <span key={index}>
              <Bold text={line} />
              {index < arr.length - 1 && <br />}
            </span>
          ))}

          {card && <RiskCard card={card} />}
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
