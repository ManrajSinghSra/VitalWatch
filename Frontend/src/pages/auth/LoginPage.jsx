import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input, PrimaryBtn } from "../../components/ui";

const DEMO_ACCOUNTS = [
  { role: "User", email: "john@gmail.com", password: "123456", icon: "👤" },
  { role: "Admin", email: "manraj@gmail.com", password: "123456", icon: "🛠️" },
  { role: "Super", email: "superadmin@vitalwatch.in", password: "12345678", icon: "🧠" },
];

const FLOATING_ITEMS = [
  { icon: "🦠", top: "10%", left: "8%", size: "text-3xl", delay: "0s", duration: "18s", tone: "text-cyan-500/20" },
  { icon: "🧬", top: "16%", left: "84%", size: "text-2xl", delay: "1.6s", duration: "20s", tone: "text-emerald-500/18" },
  { icon: "🦟", top: "72%", left: "10%", size: "text-2xl", delay: "0.7s", duration: "17s", tone: "text-rose-400/18" },
  { icon: "💧", top: "76%", left: "82%", size: "text-xl", delay: "2s", duration: "19s", tone: "text-sky-400/18" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
 

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
      e.preventDefault();
 
      if (!email || !password) {
        setError("Email and password required");
        return;
      }
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      console.log(res);
      if (res.ok) {
        if (res.role === "superadmin") navigate("/superadmin");
        else if (res.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
};


  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    setRole(acc.role);
  };

  return (
    <div className="relative isolate h-screen overflow-hidden bg-slate-50 text-slate-800">
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -12px, 0); }
        }

        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.08); opacity: 0.95; }
        }

        @keyframes scanSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          18% { opacity: 0.65; }
          100% { transform: translateX(180%); opacity: 0; }
        }

        @keyframes ambulanceRoam {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-up {
          animation: fadeUp 0.65s ease-out both;
        }

        .float-slow {
          animation: floatSlow var(--duration, 18s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          transform: translateZ(0);
        }

        .pulse-soft {
          animation: pulseSoft 3.8s ease-in-out infinite;
          transform: translateZ(0);
        }

        .scan-sweep::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.16), transparent);
          animation: scanSweep 6s linear infinite;
        }

        .ambulance-roam {
          animation: ambulanceRoam 8s linear infinite;
          offset-rotate: auto;
          transform: translateZ(0);
        }

        .defer-login {
          content-visibility: auto;
          contain-intrinsic-size: 620px;
        }

        @media (max-width: 768px) {
          .decorative-float:nth-of-type(n+3) {
            display: none;
          }

          .scan-sweep::after {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up,
          .float-slow,
          .pulse-soft,
          .scan-sweep::after,
          .ambulance-roam {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(125,211,252,0.12),transparent_28%),linear-gradient(180deg,rgba(253,254,255,0.99),rgba(241,245,249,0.99)_56%,rgba(248,250,252,1)_100%)]" />
        <div className="absolute left-[-100px] top-[-80px] h-[210px] w-[210px] rounded-full bg-cyan-200/26 blur-[54px]" />
        <div className="absolute right-[-80px] top-[30px] h-[180px] w-[180px] rounded-full bg-sky-200/20 blur-[50px]" />
        <div className="absolute left-[40%] top-[8%] h-[170px] w-[170px] rounded-full bg-blue-100/24 blur-[44px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-85" />

        {FLOATING_ITEMS.map((item) => (
          <div
            key={`${item.icon}-${item.top}-${item.left}`}
            className={`decorative-float float-slow absolute ${item.size} ${item.tone}`}
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
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-6">
        <div className="scan-sweep defer-login w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/80 bg-white/78 p-6 shadow-[0_18px_42px_rgba(14,116,144,0.08)]">
          <div className="relative flex h-full min-h-[620px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-cyan-100/80 bg-[linear-gradient(180deg,rgba(245,251,255,0.96),rgba(237,248,255,0.92)_48%,rgba(244,249,255,0.96))] px-6 py-10 text-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_38%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_30%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="absolute left-[18%] top-[52%] h-px w-[18%] bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-cyan-300/0" />
            <div className="absolute right-[18%] top-[52%] h-px w-[18%] bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-cyan-300/0" />

            <div className="absolute left-[18%] top-[54%] h-12 w-12 rounded-full border border-cyan-300/30 bg-cyan-400/10 pulse-soft" />
            <div className="absolute right-[18%] top-[54%] h-12 w-12 rounded-full border border-sky-300/30 bg-sky-400/10 pulse-soft" style={{ animationDelay: "0.9s" }} />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 980 620" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M220 340 C 350 290, 420 250, 490 250 S 650 290, 760 340" stroke="rgba(34,211,238,0.24)" strokeWidth="3" strokeLinecap="round" strokeDasharray="12 10" />
            </svg>

            <div className="ambulance-roam absolute left-0 top-0 text-2xl" style={{ offsetPath: "path('M 220 340 C 350 290, 420 250, 490 250 S 650 290, 760 340')" }}>
              <div className="rounded-2xl bg-white px-3 py-1.5 text-slate-800 shadow-[0_10px_24px_rgba(34,211,238,0.18)]">
                🚑
              </div>
            </div>

            <div className="fade-up relative z-10 flex w-full max-w-[360px] flex-col items-center text-center">
              <div className="mb-5 flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-100/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-soft" />
                VitalWatch Secure Access
              </div>

              <h1 className="whitespace-nowrap text-5xl font-black leading-none tracking-tight text-cyan-700 md:text-6xl">
                Welcome Back
              </h1>

              <p className="mt-4 text-base font-medium text-slate-500">
                Sign in to continue live health tracking
              </p>

              <div className="mt-8 w-full rounded-[26px] border border-cyan-100 bg-white/94 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.1),0_0_0_1px_rgba(255,255,255,0.7)_inset]">
                <div className="mb-4 text-left">
                  <p className="text-sm font-bold text-slate-800">Sign In</p>
                  <p className="mt-1 text-xs text-slate-500">Use your account credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon="✉️"
                  />

                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    icon="🔒"
                  />

                  <div className="flex items-center justify-end">
                    <span className="text-xs text-cyan-700">Forgot password?</span>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <PrimaryBtn type="submit" disabled={loading} className="mt-1 w-full justify-center !rounded-2xl !py-3">
                    {loading ? "Signing in..." : "Login"}
                  </PrimaryBtn>
                </form>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className="rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-white/85"
                    >
                      {acc.icon} {acc.role}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-cyan-600 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
