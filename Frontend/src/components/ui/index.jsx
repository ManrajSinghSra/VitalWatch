// src/components/ui/index.jsx

export function LiveBadge({ label = "Live", color = "emerald" }) {
  const c = color === "emerald" ? "text-emerald-400 bg-emerald-400/8 border-emerald-400/20" : "text-cyan-400 bg-cyan-400/8 border-cyan-400/20";
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${color === "emerald" ? "bg-emerald-400" : "bg-cyan-400"}`} />
      {label}
    </div>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default:  "bg-slate-700/50 text-slate-300 border-slate-600/40",
    success:  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    danger:   "bg-red-500/10 text-red-400 border-red-500/20",
    warn:     "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    info:     "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    purple:   "bg-purple-400/10 text-purple-400 border-purple-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function CardBox({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white
        border border-slate-200
        rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition
        ${className}
      `}
    >
      {children}
    </div>
  );
}
export function CardHeader({ icon, title, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
      
      <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        {icon && <span className="text-cyan-600">{icon}</span>}
        {title}
      </span>

      {right && (
        <div className="text-xs text-slate-500">
          {right}
        </div>
      )}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, accent = "cyan" }) {
  const colors = {
    cyan:    "text-cyan-600",
    emerald: "text-emerald-600",
    red:     "text-red-600",
    yellow:  "text-yellow-600",
    purple:  "text-purple-600",
  };

  const subColors =
    sub?.startsWith("+")
      ? "text-emerald-600"
      : sub?.startsWith("-")
      ? "text-red-600"
      : "text-slate-500";

  return (
    <div className="
      bg-white
      border border-slate-200
      rounded-2xl
      p-5
      flex flex-col gap-2
      shadow-sm
      hover:shadow-md
      transition
    ">
      
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {sub && (
          <span className={`text-xs font-semibold ${subColors}`}>
            {sub}
          </span>
        )}
      </div>

      <div className={`text-2xl font-black ${colors[accent]}`}>
        {value}
      </div>

      <div className="text-xs text-slate-600 font-medium">
        {label}
      </div>
    </div>
  );
}

export function PrimaryBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-cyan-600 text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_35px_rgba(0,212,255,0.4)] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border border-edge hover:border-brand/40 hover:text-brand hover:bg-brand/5 text-slate-400 transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick} title={title}
      className="w-8 h-8 rounded-lg border border-edge flex items-center justify-center text-sm text-slate-400 hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-all duration-150"
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon
}) {
  return (
    <div className="flex flex-col gap-1.5">
      
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        className={`
          flex items-center gap-2 px-3.5 py-2.5 rounded-xl
          bg-white
          border
          transition-all
          ${error ? "border-red-500 focus-within:ring-red-500" : "border-slate-300 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20"}
        `}
      >
        {icon && (
          <span className="text-slate-400 text-sm flex-shrink-0">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-transparent outline-none text-slate-800 text-sm w-full placeholder-slate-400"
        />
      </div>

      {error && (
        <span className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function SevDot({ sev }) {
  const c = { high: "bg-red-500 shadow-[0_0_6px_#ff3d5a]", medium: "bg-yellow-400 shadow-[0_0_6px_#ffb800]", low: "bg-emerald-400 shadow-[0_0_6px_#00ff9d]" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c[sev] || c.low}`} />;
}

export function AvatarCircle({ name, size = "sm" }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "md" ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 border border-cyan-400/25 flex items-center justify-center font-bold text-cyan-400 flex-shrink-0 font-head`}>
      {initials}
    </div>
  );
}
