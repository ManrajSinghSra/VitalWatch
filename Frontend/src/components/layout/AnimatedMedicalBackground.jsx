const FLOATING_GERMS = [
  { icon: "🦠", top: "14%", left: "7%", size: "text-3xl", tone: "text-cyan-500/25", delay: "0s", duration: "18s" },
  { icon: "🧬", top: "22%", left: "84%", size: "text-2xl", tone: "text-emerald-500/20", delay: "1.4s", duration: "20s" },
  { icon: "🦟", top: "56%", left: "8%", size: "text-2xl", tone: "text-rose-500/20", delay: "0.6s", duration: "17s" },
  { icon: "🧫", top: "68%", left: "86%", size: "text-2xl", tone: "text-amber-500/20", delay: "2.4s", duration: "21s" },
  { icon: "🦠", top: "78%", left: "18%", size: "text-2xl", tone: "text-teal-500/20", delay: "1s", duration: "19s" },
];

const MEDICAL_MARKERS = [
  {
    icon: "🏥",
    label: "City Hospital",
    sub: "Emergency wing ready",
    top: "18%",
    right: "6%",
    delay: "0s",
    tone: "border-cyan-200/80 bg-white/80 text-cyan-700",
  },
  {
    icon: "🚑",
    label: "Ambulance",
    sub: "Route patrol active",
    top: "50%",
    right: "4%",
    delay: "1.1s",
    tone: "border-emerald-200/80 bg-white/78 text-emerald-700",
  },
  {
    icon: "🏥",
    label: "Clinic",
    sub: "Beds available",
    top: "73%",
    right: "13%",
    delay: "0.8s",
    tone: "border-rose-200/80 bg-white/78 text-rose-700",
  },
];

export default function AnimatedMedicalBackground() {
  return (
    <>
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
    </>
  );
}
