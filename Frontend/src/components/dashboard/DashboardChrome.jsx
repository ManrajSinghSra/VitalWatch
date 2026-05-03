import { useNavigate } from "react-router-dom";

export const DASHBOARD_GERMS = [
  { icon: "🦠", top: "14%", left: "7%", size: "text-3xl", tone: "text-cyan-500/25", delay: "0s", duration: "18s" },
  { icon: "🧬", top: "22%", left: "84%", size: "text-2xl", tone: "text-emerald-500/20", delay: "1.4s", duration: "20s" },
  { icon: "🦟", top: "56%", left: "8%", size: "text-2xl", tone: "text-rose-500/20", delay: "0.6s", duration: "17s" },
  { icon: "🫁", top: "68%", left: "86%", size: "text-2xl", tone: "text-amber-500/20", delay: "2.4s", duration: "21s" },
  { icon: "🦠", top: "78%", left: "18%", size: "text-2xl", tone: "text-teal-500/20", delay: "1s", duration: "19s" },
];

export const DASHBOARD_MEDICAL_MARKERS = [
  {
    icon: "🏥",
    label: "City Hospital",
    sub: "Emergency wing ready",
    top: "19%",
    right: "7%",
    delay: "0s",
    tone: "border-cyan-200/80 bg-white/80 text-cyan-700",
  },
  {
    icon: "🚑",
    label: "Ambulance",
    sub: "Route patrol active",
    top: "51%",
    right: "4%",
    delay: "1.1s",
    tone: "border-emerald-200/80 bg-white/78 text-emerald-700",
  },
  {
    icon: "🏥",
    label: "Clinic",
    sub: "Beds available",
    top: "74%",
    right: "13%",
    delay: "0.8s",
    tone: "border-rose-200/80 bg-white/78 text-rose-700",
  },
];

export function DashboardMotionStyles() {
  return (
    <style>{`
      @keyframes dashboardFloat {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -12px, 0); }
      }

      @keyframes dashboardPulse {
        0%, 100% { transform: translateY(0); opacity: 0.7; }
        50% { transform: translateY(-6px); opacity: 1; }
      }

      .dashboard-float {
        animation: dashboardFloat var(--duration, 18s) ease-in-out infinite;
        animation-delay: var(--delay, 0s);
        transform: translateZ(0);
      }

      .dashboard-pulse {
        animation: dashboardPulse 4s ease-in-out infinite;
        animation-delay: var(--delay, 0s);
        transform: translateZ(0);
      }

      @media (max-width: 1024px) {
        .dashboard-medical:nth-of-type(3) {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .dashboard-germ:nth-of-type(n+4),
        .dashboard-medical:nth-of-type(n+2) {
          display: none;
        }
      }
    `}</style>
  );
}

export function DashboardBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_14%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(250,254,255,0.98),rgba(241,245,249,0.98)_60%,rgba(248,250,252,1)_100%)]" />
      <div className="absolute left-[-120px] top-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/35 blur-[90px]" />
      <div className="absolute right-[-80px] top-[40px] h-[240px] w-[240px] rounded-full bg-emerald-200/30 blur-[90px]" />
      <div className="absolute left-[42%] top-[8%] h-[220px] w-[220px] rounded-full bg-sky-100/40 blur-[80px]" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent_90%)]" />

      {DASHBOARD_GERMS.map((item) => (
        <div
          key={`${item.icon}-${item.top}-${item.left}`}
          className={`dashboard-germ dashboard-float absolute ${item.size} ${item.tone}`}
          style={{
            top: item.top,
            left: item.left,
            "--delay": item.delay,
            "--duration": item.duration,
          }}
        >
          {item.icon}
        </div>
      ))}

      {DASHBOARD_MEDICAL_MARKERS.map((marker) => (
        <div
          key={`${marker.label}-${marker.top}`}
          className={`dashboard-medical dashboard-pulse absolute rounded-full border px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm ${marker.tone}`}
          style={{ top: marker.top, right: marker.right, "--delay": marker.delay }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{marker.icon}</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em]">{marker.label}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">{marker.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VitalWatchBrand() {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_34px_rgba(56,189,248,0.12)]">
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="h-7 w-7 drop-shadow-[0_7px_12px_rgba(14,165,233,0.22)]"
        >
          <defs>
            <linearGradient id="vitalwatch-shield" x1="10" y1="7" x2="39" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6EE7F9" />
              <stop offset="0.48" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path
            d="M24 6.5 37 11v10.2c0 8.5-5.1 16.1-13 19.3-7.9-3.2-13-10.8-13-19.3V11l13-4.5Z"
            fill="url(#vitalwatch-shield)"
          />
          <path
            d="M24 10.4v25.4c5.4-2.7 8.7-8.2 8.7-14.6v-7L24 10.4Z"
            fill="#4F46E5"
            opacity="0.4"
          />
          <path
            d="M16.2 14.5 24 11.8l7.8 2.7v6.9c0 5.8-3 10.9-7.8 13.5-4.8-2.6-7.8-7.7-7.8-13.5v-6.9Z"
            fill="none"
            stroke="rgba(255,255,255,0.68)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <div className="text-[1.72rem] font-black leading-none tracking-normal text-slate-800 md:text-[1.95rem]">
          Vital<span className="text-teal-500">Watch</span>
        </div>
        <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.46em] text-slate-500">
          Predictive Health Signal
        </p>
      </div>
    </div>
  );
}

export function DashboardHeader({ tabs, activeTab, onTabChange, userName, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 px-6 pt-5 md:px-8">
      <header className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 rounded-[30px] border border-white/75 bg-[#d8f9ff]/72 px-5 py-3.5 shadow-[0_18px_70px_rgba(125,211,252,0.18)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <button type="button" onClick={() => navigate("/")} className="text-left">
          <VitalWatchBrand />
        </button>

        <div className="flex w-full justify-center lg:w-auto">
          <div className="flex w-full max-w-[680px] items-center gap-2 rounded-full border border-white/80 bg-white/62 p-2 shadow-inner shadow-cyan-100/70 lg:w-auto">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`flex-1 rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] transition-all duration-200 md:text-sm ${
                  activeTab === key
                    ? "bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)]"
                    : "text-slate-500 hover:bg-white/80 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 whitespace-nowrap">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/62 px-5 py-3 text-sm font-bold uppercase tracking-[0.28em] text-emerald-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Live
          </div>

          <button type="button" className="rounded-full border border-white/80 bg-white/68 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
            {userName}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-7 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(20,184,166,0.28)] transition hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(20,184,166,0.34)]"
          >
            Sign Out
          </button>
        </div>
      </header>
    </div>
  );
}
