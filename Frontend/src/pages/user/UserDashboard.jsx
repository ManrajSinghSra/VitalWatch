import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatWindow from "../../components/chat/ChatWindow";
import { DataSourcesPanel, DiseaseSidebar, OutbreakMap, WeeklyTrend } from "../../components/dashboard/DashWidgets";
import { HERO_STATS } from "../../data/mockData";
import { toast } from "../../components/ui/Toast";

const USER_TABS = [
  { key: "chat", label: "AI Chat" },
  { key: "alerts", label: "Alerts" },
  { key: "map", label: "Disease Map" },
  { key: "reports", label: "Reports" },
];

const FLOATING_GERMS = [
  { icon: "🦠", top: "14%", left: "7%", size: "text-3xl", tone: "text-cyan-500/25", delay: "0s", duration: "18s" },
  { icon: "🧬", top: "22%", left: "84%", size: "text-2xl", tone: "text-emerald-500/20", delay: "1.4s", duration: "20s" },
  { icon: "🦟", top: "56%", left: "8%", size: "text-2xl", tone: "text-rose-500/20", delay: "0.6s", duration: "17s" },
  { icon: "🫁", top: "68%", left: "86%", size: "text-2xl", tone: "text-amber-500/20", delay: "2.4s", duration: "21s" },
  { icon: "🦠", top: "78%", left: "18%", size: "text-2xl", tone: "text-teal-500/20", delay: "1s", duration: "19s" },
];

const MEDICAL_MARKERS = [
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

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("chat");

  useEffect(() => {
    const t1 = setTimeout(() => {
      toast({
        icon: "Alert",
        title: "Dengue Alert",
        body: "Cases +24% in Mohali this week",
        urgent: true,
      });
    }, 1800);

    const t2 = setTimeout(() => {
      toast({
        icon: "Report",
        title: "Week 12 Report",
        body: "IDSP bulletin processed and summarized",
      });
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] || "User";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSOS = () => {
    toast({
      icon: "Emergency",
      title: "Emergency",
      body: "Connecting to helpline...",
      urgent: true,
    });
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800">
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

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_85%_14%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(250,254,255,0.98),rgba(241,245,249,0.98)_60%,rgba(248,250,252,1)_100%)]" />
        <div className="absolute left-[-120px] top-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/35 blur-[90px]" />
        <div className="absolute right-[-80px] top-[40px] h-[240px] w-[240px] rounded-full bg-emerald-200/30 blur-[90px]" />
        <div className="absolute left-[42%] top-[8%] h-[220px] w-[220px] rounded-full bg-sky-100/40 blur-[80px]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.55),transparent_90%)]" />

        {FLOATING_GERMS.map((item) => (
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

        {MEDICAL_MARKERS.map((marker) => (
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

      <div className="relative z-10 px-6 pt-5 md:px-8">
        <header className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 rounded-[30px] border border-white/70 bg-white/55 px-5 py-3.5 shadow-[0_18px_70px_rgba(148,184,197,0.18)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-4 text-left"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-100 shadow-inner shadow-white/60">
              <span className="text-2xl">VS</span>
            </div>

            <div>
              <div className="text-[2rem] font-black leading-none tracking-tight text-slate-800">
                Vital<span className="text-teal-500">Watch</span>
              </div>
              <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.42em] text-slate-500">
                Predictive Health Signal
              </p>
            </div>
          </button>

          <div className="flex w-full justify-center lg:w-auto">
            <div className="flex w-full max-w-[560px] items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 p-2 shadow-inner shadow-slate-100 lg:w-auto">
              {USER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`flex-1 rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] transition-all duration-200 md:text-sm ${
                    tab === key
                      ? "bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)]"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 whitespace-nowrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold uppercase tracking-[0.28em] text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Live
            </div>

            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {firstName}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-7 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(20,184,166,0.28)] transition hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(20,184,166,0.34)]"
            >
              Sign Out
            </button>
          </div>
        </header>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-8 py-8">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_auto_290px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1.5 text-xs font-semibold uppercase text-cyan-700">
              AI-Powered · IDSP · WHO · NCDC
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Know What&apos;s <br />
              Spreading <span className="text-cyan-600">Near You</span>
            </h1>

            <p className="mt-3 max-w-lg text-sm text-slate-600">
              Hey <span className="font-medium">{firstName}</span>, your region shows{" "}
              <span className="font-medium text-yellow-600">moderate risk</span>.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 xl:self-center">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[150px] rounded-2xl border border-slate-200/80 bg-white/92 px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
              >
                <span className="text-2xl font-black text-cyan-600">{stat.num}</span>
                <span className="mt-1 block text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSOS}
            className="w-full rounded-[28px] border border-rose-200 bg-rose-50/80 p-5 text-left shadow-[0_12px_28px_rgba(244,63,94,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(244,63,94,0.12)] xl:max-w-[290px]"
          >
            <div className="rounded-[18px] bg-[#fb4343] px-6 py-5 text-center text-white shadow-[0_14px_28px_rgba(251,67,67,0.24)]">
              <p className="text-[1.05rem] font-black tracking-tight">🚨 SOS Emergency</p>
            </div>
            <p className="pt-4 text-center text-lg font-medium text-slate-500">Tap for nearest help</p>
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] flex-1 gap-4 px-8 pb-12 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <DiseaseSidebar />
        <div className="xl:col-span-2">
          <ChatWindow />
        </div>

        <DataSourcesPanel />
        <OutbreakMap />
        <WeeklyTrend />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-8 pb-8">
        <div className="flex gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <span className="text-yellow-600">!</span>
          <p className="text-xs text-slate-600">
            <strong className="text-yellow-700">Disclaimer:</strong> This is not a diagnostic
            tool. Consult a healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}
