import { useNavigate } from "react-router-dom";
import { ALERTS, HERO_STATS } from "../data/mockData";
import { SevDot } from "../components/ui";

const FEATURES = [
  {
    icon: "📍",
    title: "Location-Based Alerts",
    desc: "Get disease outbreak alerts specific to your city or district powered by live surveillance feeds.",
  },
  {
    icon: "🤖",
    title: "AI Health Chatbot",
    desc: "Ask VitalWatch what is spreading near you and get clear precautions in plain language.",
  },
  {
    icon: "📊",
    title: "Weekly Report Summaries",
    desc: "Dense government reports become short, useful insights you can read in seconds.",
  },
  {
    icon: "🔔",
    title: "Outbreak Notifications",
    desc: "Receive fast updates the moment unusual disease activity is flagged in your area.",
  },
  {
    icon: "🗺️",
    title: "Interactive Disease Map",
    desc: "Track clusters, hotspots, and district trends across the regions you care about most.",
  },
  {
    icon: "🚨",
    title: "SOS Emergency Support",
    desc: "Find nearby care, helplines, and emergency guidance without wasting crucial time.",
  },
];

const NAV_LINKS = ["Signals", "Coverage", "Response"];

const FLOATING_GERMS = [
  { icon: "🦠", top: "13%", left: "7%", size: "text-3xl", delay: "0s", duration: "18s", opacity: "text-cyan-500/25" },
  { icon: "🧬", top: "22%", left: "82%", size: "text-2xl", delay: "2s", duration: "20s", opacity: "text-emerald-500/20" },
  { icon: "🦟", top: "54%", left: "9%", size: "text-2xl", delay: "1s", duration: "17s", opacity: "text-rose-500/20" },
  { icon: "🫁", top: "60%", left: "88%", size: "text-2xl", delay: "3s", duration: "21s", opacity: "text-amber-500/20" },
  { icon: "💧", top: "78%", left: "18%", size: "text-xl", delay: "0.5s", duration: "19s", opacity: "text-sky-500/20" },
  { icon: "🦠", top: "75%", left: "76%", size: "text-2xl", delay: "1.6s", duration: "22s", opacity: "text-teal-500/20" },
];

const SKY_LINES = [
  { top: "16%", width: "260px", delay: "0s", duration: "22s" },
  { top: "38%", width: "180px", delay: "1.3s", duration: "18s" },
  { top: "68%", width: "220px", delay: "2.1s", duration: "24s" },
];

const DISEASE_CHIPS = [
  { name: "Dengue", cases: "312 cases", accent: "border-rose-200 bg-rose-50/80 text-rose-700" },
  { name: "Influenza H3N2", cases: "189 cases", accent: "border-amber-200 bg-amber-50/80 text-amber-700" },
  { name: "Typhoid", cases: "97 cases", accent: "border-orange-200 bg-orange-50/80 text-orange-700" },
  { name: "Cholera Watch", cases: "11 flagged", accent: "border-cyan-200 bg-cyan-50/80 text-cyan-700" },
];

const SOS_CALLS = [
  { label: "SOS", sub: "Emergency line engaged", top: "12%", right: "8%", delay: "0s" },
  { label: "HELP", sub: "Nearest clinic pinged", top: "48%", right: "2%", delay: "1.5s" },
  { label: "ALERT", sub: "Rapid response active", top: "74%", right: "14%", delay: "0.8s" },
];

const CORRIDOR_MARKERS = [
  {
    icon: "🦟",
    label: "Dengue cluster",
    detail: "North sector",
    tone: "border-rose-300/40 bg-rose-400/20 text-rose-50",
    glow: "bg-rose-400/20",
    accent: "text-rose-100",
  },
  {
    icon: "😷",
    label: "Respiratory wave",
    detail: "Central link",
    tone: "border-amber-300/40 bg-amber-300/20 text-amber-50",
    glow: "bg-amber-300/20",
    accent: "text-amber-100",
  },
];

const RESPONSE_CARDS = [
  { title: "SOS", body: "2 urgent pings", tone: "border-rose-200/20 bg-rose-400/10 text-rose-50" },
  { title: "Call", body: "Clinic notified", tone: "border-cyan-200/20 bg-cyan-400/10 text-cyan-50" },
  { title: "Route", body: "Ambulance roaming", tone: "border-emerald-200/20 bg-emerald-400/10 text-emerald-50" },
];

const HOSPITAL_POINTS = [
  { name: "Civil Hospital", pos: "left-[14%] top-[58%]", labelClass: "left-[-8px] -top-[42px]" },
  { name: "Trauma Center", pos: "left-[54%] top-[28%]", labelClass: "right-[-8px] top-[54px]" },
  { name: "City Clinic", pos: "left-[72%] top-[62%]", labelClass: "right-[-6px] -top-[42px]" },
];

const ALERT_STYLES = {
  high: {
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    glow: "from-rose-400/30 via-rose-300/10 to-transparent",
    ring: "bg-rose-500/15 border-rose-300/40",
  },
  medium: {
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    glow: "from-amber-300/30 via-amber-200/10 to-transparent",
    ring: "bg-amber-400/15 border-amber-200/40",
  },
  low: {
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    glow: "from-emerald-300/30 via-emerald-200/10 to-transparent",
    ring: "bg-emerald-400/15 border-emerald-200/40",
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
      <style>{`
        .defer-section {
          content-visibility: auto;
          contain-intrinsic-size: 700px;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        @keyframes driftAcross {
          0% { transform: translate3d(-10vw, 0, 0); opacity: 0; }
          15%, 85% { opacity: 1; }
          100% { transform: translate3d(110vw, 0, 0); opacity: 0; }
        }

        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.06); opacity: 0.9; }
        }

        @keyframes pulseCall {
          0%, 100% { transform: translateY(0); opacity: 0.72; }
          50% { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes ambulanceRoam {
          0% { transform: translate3d(-14%, 0, 0); }
          50% { transform: translate3d(44vw, -4px, 0); }
          100% { transform: translate3d(105vw, 0, 0); }
        }

        @keyframes roadShift {
          from { background-position-x: 0; }
          to { background-position-x: 72px; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes mapPing {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          60% { transform: scale(1.22); opacity: 0; }
        }

        @keyframes routePulse {
          0% { background-position: 0 0; }
          100% { background-position: 120px 0; }
        }

        @keyframes ambulanceLoop {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }

        .hero-fade-up {
          animation: fadeUp 0.7s ease-out both;
        }

        .float-slow {
          animation: floatSlow var(--duration, 18s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          transform: translateZ(0);
        }

        .drift-across {
          animation: driftAcross var(--duration, 20s) linear infinite;
          animation-delay: var(--delay, 0s);
          transform: translateZ(0);
        }

        .pulse-soft {
          animation: pulseSoft 4s ease-in-out infinite;
          transform: translateZ(0);
        }

        .pulse-call {
          animation: pulseCall 3.6s ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          transform: translateZ(0);
        }

        .ambulance-roam {
          animation: ambulanceRoam 15s linear infinite;
          transform: translateZ(0);
        }

        .road-shift {
          animation: roadShift 2s linear infinite;
        }

        .map-ping::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 999px;
          border: 1px solid rgba(34, 211, 238, 0.35);
          animation: mapPing 2.8s ease-out infinite;
        }

        .route-pulse {
          animation: routePulse 3.6s linear infinite;
        }

        .ambulance-loop {
          animation: ambulanceLoop 8s linear infinite;
          offset-rotate: auto;
          transform: translateZ(0);
        }

        @media (max-width: 1024px) {
          .decorative-call:nth-of-type(2),
          .decorative-call:nth-of-type(3) {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .decorative-germ:nth-of-type(n+4),
          .decorative-line:nth-of-type(n+2) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up,
          .float-slow,
          .drift-across,
          .pulse-soft,
          .pulse-call,
          .ambulance-roam,
          .road-shift,
          .map-ping::after,
          .route-pulse,
          .ambulance-loop {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_14%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(250,254,255,0.98),rgba(241,245,249,0.98)_60%,rgba(248,250,252,1)_100%)]" />
        <div className="absolute left-[-120px] top-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/35 blur-[90px]" />
        <div className="absolute right-[-80px] top-[40px] h-[240px] w-[240px] rounded-full bg-emerald-200/30 blur-[90px]" />
        <div className="absolute left-[42%] top-[8%] h-[220px] w-[220px] rounded-full bg-sky-100/40 blur-[80px]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent_90%)]" />

        {FLOATING_GERMS.map((item) => (
          <div
            key={`${item.icon}-${item.top}-${item.left}`}
            className={`decorative-germ float-slow absolute ${item.size} ${item.opacity}`}
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

        {SKY_LINES.map((line) => (
          <div
            key={line.top}
            className="decorative-line drift-across absolute h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent"
            style={{
              top: line.top,
              width: line.width,
              "--delay": line.delay,
              "--duration": line.duration,
            }}
          />
        ))}

        {SOS_CALLS.map((call) => (
          <div
            key={call.label + call.top}
            className="decorative-call pulse-call absolute rounded-full border border-rose-200/70 bg-white/75 px-3 py-2 shadow-[0_8px_24px_rgba(244,63,94,0.06)] backdrop-blur-sm"
            style={{ top: call.top, right: call.right, "--delay": call.delay }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">{call.label}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">{call.sub}</p>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4 md:px-8">
        <nav className="mx-auto flex max-w-[1280px] items-center justify-between rounded-[24px] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_16px_40px_rgba(14,116,144,0.08)] backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-white to-cyan-100 text-lg shadow-[0_10px_24px_rgba(34,211,238,0.18)]">
              🛡️
            </div>

            <div>
              <span className="block text-xl font-black tracking-tight">
                Vital<span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">Watch</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Predictive health signal
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-2 py-2 lg:flex">
            {NAV_LINKS.map((link, index) => (
              <span
                key={link}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                  index === 0 ? "bg-slate-900 text-cyan-50" : "text-slate-500"
                }`}
              >
                {link}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 md:flex">
              <span className="pulse-soft h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">Live</span>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-300 hover:text-slate-900"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[linear-gradient(135deg,#0891b2,#14b8a6)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(8,145,178,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(20,184,166,0.24)]"
            >
              Get Started Free
            </button>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-12 px-6 pb-20 pt-12 md:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:pt-20">
        <div className="hero-fade-up relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
            AI-Powered · IDSP · WHO · NCDC · Real-Time
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-6xl xl:text-7xl">
            Track what is
            <span className="block text-cyan-600">spreading around you</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            VitalWatch turns raw health surveillance into a faster, calmer public health signal system with live alerts,
            roaming response visuals, and clearer local disease awareness.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-xl bg-cyan-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-cyan-600"
            >
              Start for Free
            </button>

            <button
              onClick={() => navigate("/login")}
              className="rounded-xl border border-slate-300 bg-white/80 px-7 py-3.5 font-medium text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600"
            >
              Sign In
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {DISEASE_CHIPS.map((chip, index) => (
              <div
                key={chip.name}
                className="hero-fade-up rounded-2xl border border-white/80 bg-white/78 px-4 py-3 shadow-sm"
                style={{ animationDelay: `${0.12 * (index + 1)}s` }}
              >
                <p className={`rounded-full border px-3 py-1 text-xs font-semibold ${chip.accent}`}>{chip.name}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">{chip.cases}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            {HERO_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="hero-fade-up min-w-[160px] rounded-2xl border border-white/80 bg-white/84 px-6 py-5 text-left shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                style={{ animationDelay: `${0.15 * (index + 2)}s` }}
              >
                <p className="text-3xl font-black text-cyan-600">{stat.num}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
              </div>
            ))}

            <div className="hero-fade-up min-w-[160px] rounded-2xl border border-white/80 bg-white/84 px-6 py-5 text-left shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
              <p className="text-3xl font-black text-emerald-500">Free</p>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">For Public Users</p>
            </div>
          </div>

          <div className="hero-fade-up mt-10 max-w-[700px] rounded-[30px] border border-white/80 bg-white/84 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] backdrop-blur-md" style={{ animationDelay: "0.35s" }}>
            <div className="grid gap-5 md:grid-cols-[0.88fr_1.12fr] md:items-center">
              <div className="max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-600">Nearest Hospitals Map</p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-slate-800">See the closest hospitals around your live location.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  An animated location map will guide users to the nearest hospitals, clinics, and emergency support points in real time.
                </p>
              </div>

              <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-cyan-100/80 bg-[linear-gradient(180deg,#effbff,#edf7ff)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="absolute inset-[14px] rounded-[22px] border border-white/70" />
                <div className="absolute left-[14%] top-[72%] rounded-full border border-sky-200 bg-white/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
                  You
                </div>

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 270" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M55 200 C 90 160, 120 150, 150 130 S 220 80, 255 72"
                    stroke="rgba(8,145,178,0.22)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M55 200 C 90 160, 120 150, 150 130 S 220 80, 255 72"
                    stroke="rgba(8,145,178,0.9)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="10 10"
                    className="route-pulse"
                  />
                  <path
                    d="M255 72 C 270 92, 278 125, 276 160"
                    stroke="rgba(16,185,129,0.6)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="8 10"
                  />
                </svg>

                <div
                  className="ambulance-loop absolute left-0 top-0 text-2xl"
                  style={{ offsetPath: "path('M 55 200 C 90 160, 120 150, 150 130 S 220 80, 255 72')" }}
                >
                  <div className="rounded-2xl bg-white px-3 py-1.5 shadow-[0_10px_24px_rgba(8,145,178,0.18)]">🚑</div>
                </div>

                {HOSPITAL_POINTS.map((point) => (
                  <div key={point.name} className={`absolute ${point.pos}`}>
                    <div className="map-ping relative flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)]">
                      +
                    </div>
                    <div className={`absolute whitespace-nowrap rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm ${point.labelClass}`}>
                      {point.name}
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-3 left-4 right-4 rounded-[20px] bg-emerald-50/92 px-4 py-4 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Next release</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Nearest care in one tap</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-fade-up relative z-10" style={{ animationDelay: "0.15s" }}>
          <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/76 p-5 shadow-[0_18px_52px_rgba(14,116,144,0.1)] backdrop-blur-md">
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="pulse-soft h-2 w-2 rounded-full bg-emerald-500" />
              Live movement
            </div>

            <div className="rounded-[28px] border border-cyan-950/10 bg-[linear-gradient(135deg,#082f49,#0f172a_48%,#134e4a)] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Response Corridor</p>
                  <h2 className="mt-2 text-2xl font-black md:text-3xl">Real-time outbreak motion</h2>
                </div>

                <div className="rounded-2xl border border-cyan-300/15 bg-white/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Current focus</p>
                  <p className="mt-1 text-lg font-bold text-cyan-50">Mohali to Chandigarh</p>
                </div>
              </div>

              <div className="relative mt-8 overflow-hidden rounded-[26px] border border-white/10 bg-white/5 px-5 pb-8 pt-6">
                <div className="relative flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-cyan-100/60">
                  <span>North zone</span>
                  <span>Central link</span>
                  <span>South zone</span>
                </div>

                <div className="relative mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/25 p-4 sm:p-5">
                    <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.08),transparent_18%),radial-gradient(circle_at_55%_50%,rgba(250,204,21,0.08),transparent_18%),radial-gradient(circle_at_78%_28%,rgba(34,211,238,0.08),transparent_16%)]" />

                    <div className="relative z-10 grid gap-3 md:grid-cols-2">
                      {CORRIDOR_MARKERS.map((marker, index) => (
                        <div key={marker.label} className="min-w-0 rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-4 md:block">
                            <div className="relative flex-shrink-0 md:mb-4 md:flex md:justify-center">
                              <div className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full ${marker.glow} pulse-soft`} style={{ animationDelay: `${index * 0.8}s` }} />
                              <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border text-xl ${marker.tone}`}>
                                {marker.icon}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className={`text-sm font-bold uppercase leading-5 tracking-[0.14em] md:text-xs md:tracking-[0.2em] ${marker.accent}`}>
                                {marker.label}
                              </p>
                              <p className="mt-1 text-base leading-7 text-cyan-100/70 md:mt-2 md:text-sm md:leading-6">{marker.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="relative z-10 mt-4 rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                      <div className="flex flex-col gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">Ambulance route</p>
                          <p className="mt-2 max-w-[320px] text-sm leading-6 text-cyan-50/75">
                            Patrol moving across the corridor and syncing active channels.
                          </p>
                        </div>
                        <div className="w-fit max-w-full self-start rounded-full border border-cyan-200/15 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80 sm:text-[11px] sm:tracking-[0.24em]">
                          3 active channels
                        </div>
                      </div>

                      <div className="relative mt-5 h-16 overflow-hidden rounded-full border-t border-cyan-100/10 bg-gradient-to-r from-transparent via-slate-950/85 to-transparent">
                        <div className="road-shift absolute inset-x-[-8%] bottom-4 h-1.5 bg-[linear-gradient(90deg,transparent_0_8%,rgba(255,255,255,0.78)_8_12%,transparent_12_22%)] opacity-80" />
                        <div className="ambulance-roam absolute bottom-[10px] left-[-12%] flex items-center gap-2">
                          <div className="relative rounded-2xl border border-cyan-100/15 bg-white px-4 py-2 text-2xl shadow-[0_12px_32px_rgba(34,211,238,0.14)]">
                            🚑
                            <span className="pulse-soft absolute -left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-400" />
                            <span className="pulse-soft absolute -right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-300" style={{ animationDelay: "0.5s" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-4 rounded-[22px] border border-cyan-100/10 bg-slate-950/72 px-5 py-4 text-cyan-50 shadow-[0_16px_40px_rgba(2,6,23,0.28)]">
                      <div className="flex flex-col gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">Response update</p>
                          <p className="mt-3 max-w-[360px] text-lg font-semibold leading-7">
                            SOS calls routed while ambulance patrol scans the corridor
                          </p>
                        </div>

                        <div className="w-fit rounded-full border border-emerald-200/15 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
                          Response synced
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">Focus zone</p>
                      <p className="mt-2 text-xl font-bold text-white">Mohali to Chandigarh</p>
                      <p className="mt-2 text-sm text-cyan-100/70">Live corridor with clustered disease signals and response movement.</p>
                    </div>

                    {RESPONSE_CARDS.map((card) => (
                      <div key={card.title} className={`rounded-[20px] border p-4 ${card.tone}`}>
                        <p className="text-xs font-bold uppercase tracking-[0.25em]">{card.title}</p>
                        <p className="mt-2 text-lg font-bold">{card.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">Hotspot</p>
                    <p className="mt-2 text-lg font-bold text-white">Dengue spike</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">Response</p>
                    <p className="mt-2 text-lg font-bold text-white">Ambulance roaming</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">Calls</p>
                    <p className="mt-2 text-lg font-bold text-white">SOS relay active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="defer-section relative z-10 mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black">Live Disease Alerts</h2>
          <p className="mt-2 text-sm text-slate-500">Updated weekly from trusted government sources</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5">
          {ALERTS.map((alert, index) => (
            <div
              key={alert.id}
              className="hero-fade-up group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/92 px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)] md:px-7"
              style={{ animationDelay: `${0.07 * index}s` }}
            >
              <div className={`absolute inset-y-0 left-0 w-28 bg-gradient-to-r ${ALERT_STYLES[alert.sev]?.glow || ALERT_STYLES.low.glow}`} />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4 md:gap-5">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border ${ALERT_STYLES[alert.sev]?.ring || ALERT_STYLES.low.ring}`}>
                    <SevDot sev={alert.sev} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-2xl font-black tracking-tight text-slate-800">{alert.name}</p>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${ALERT_STYLES[alert.sev]?.chip || ALERT_STYLES.low.chip}`}>
                        {alert.sev} risk
                      </span>
                    </div>

                    <p className="mt-3 text-base text-slate-500">📍 {alert.location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 md:min-w-[220px] md:justify-end md:border-t-0 md:border-l md:pl-6 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Reported cases</p>
                    <p className="mt-1 text-3xl font-black text-slate-800">{alert.cases}</p>
                  </div>

                  <div className="hidden h-12 w-px bg-slate-200 md:block" />

                  <div className="hidden rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-50 md:block">
                    Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="defer-section relative z-10 mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black">Everything You Need</h2>
          <p className="mt-2 text-sm text-slate-500">Clear signals, faster action, and a calmer experience</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="hero-fade-up rounded-3xl border border-slate-200 bg-white/88 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${0.08 * index}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-emerald-100 text-2xl shadow-inner">
                {feature.icon}
              </div>
              <p className="mb-2 text-sm font-bold">{feature.title}</p>
              <p className="text-sm leading-6 text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="defer-section relative z-10 mx-auto max-w-[900px] px-6 py-20 text-center md:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-white/86 px-8 py-14 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-4xl font-black">
            Stay ahead of <span className="text-cyan-600">outbreaks</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Join people using VitalWatch for real-time public health awareness, cleaner summaries, and faster local response.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-8 rounded-xl bg-cyan-500 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:bg-cyan-600"
          >
            Create Free Account
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <span className="text-sm font-bold">VitalWatch</span>
          <p className="text-xs text-slate-500">© 2026 · Health data platform</p>
        </div>
      </footer>
    </div>
  );
}
