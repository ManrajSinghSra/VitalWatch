// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import { ALERTS, HERO_STATS } from "../data/mockData";
import { SevDot } from "../components/ui";

const FEATURES = [
  { icon: "📍", title: "Location-Based Alerts",    desc: "Get disease outbreak alerts specific to your city or district — powered by live IDSP surveillance data." },
  { icon: "🤖", title: "AI Health Chatbot",         desc: "Ask Vita anything about outbreaks near you. Get precautions, summaries, and risk levels in plain language." },
  { icon: "📊", title: "Weekly Report Summaries",   desc: "Complex government PDFs transformed into simple, readable insights you can actually understand." },
  { icon: "🔔", title: "Outbreak Notifications",    desc: "Real-time push alerts when new disease activity is detected in your area." },
  { icon: "🗺️", title: "Interactive Disease Map",   desc: "Visual outbreak heatmap showing disease concentration across Punjab, Haryana, and surrounding states." },
  { icon: "🚨", title: "SOS Emergency Support",     desc: "One tap to get nearest health facilities, helpline numbers, and emergency guidance." },
];

// src/pages/LandingPage.jsx
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">

      {/* Soft background accents */}
      <div className="fixed top-[-100px] left-[-80px] w-[400px] h-[400px] rounded-full bg-cyan-200/40 blur-[120px]" />
      <div className="fixed bottom-0 right-[-80px] w-[350px] h-[350px] rounded-full bg-emerald-200/40 blur-[100px]" />
      <div className="fixed top-[40%] left-[40%] w-[250px] h-[250px] rounded-full bg-purple-200/30 blur-[90px]" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center text-sm">🛡️</div>
          <span className="font-black text-xl tracking-tight">
            Vital<span className="text-cyan-600">Watch</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            Sign In
          </button>

          <button onClick={() => navigate("/signup")}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-10 pt-24 pb-20 max-w-[1280px] mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            ⚡ AI-Powered · IDSP · WHO · NCDC · Real-Time
          </div>

          <h1 className="font-black text-5xl tracking-tight leading-tight mb-6">
            Know What's <br />
            Spreading{" "}
            <span className="text-cyan-600">Near You</span>
          </h1>

          <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
            VitalWatch converts raw government health reports into actionable insights —
            so you know what's spreading in your area and how to stay safe.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => navigate("/signup")}
              className="px-7 py-3.5 rounded-xl font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition">
              🚀 Start for Free
            </button>

            <button onClick={() => navigate("/login")}
              className="px-7 py-3.5 rounded-xl font-medium border border-slate-300 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 transition">
              Sign In →
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-16 flex-wrap">
          {HERO_STATS.map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-8 py-5 text-center shadow-sm">
              <p className="font-black text-3xl text-cyan-600">{s.num}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
          <div className="bg-white border border-slate-200 rounded-2xl px-8 py-5 text-center shadow-sm">
            <p className="font-black text-3xl text-emerald-500">Free</p>
            <p className="text-xs text-slate-500 mt-1">For Public Users</p>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="px-10 py-16 max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-black text-3xl mb-2">Live Disease Alerts</h2>
          <p className="text-slate-500 text-sm">Updated weekly from government sources</p>
        </div>

        <div className="grid gap-3 max-w-2xl mx-auto">
          {ALERTS.map(a => (
            <div key={a.id}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-md transition">
              
              <SevDot sev={a.sev} />

              <div className="flex-1">
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-slate-500">📍 {a.location}</p>
              </div>

              <span className="text-sm font-bold text-slate-700">{a.cases} cases</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-10 py-16 max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-black text-3xl mb-2">Everything You Need</h2>
          <p className="text-slate-500 text-sm">Built for real users, not just demos</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition">
              
              <div className="text-xl mb-4">{f.icon}</div>
              <p className="font-bold text-sm mb-2">{f.title}</p>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-20 text-center max-w-[800px] mx-auto">
        <h2 className="font-black text-4xl mb-4">
          Stay Ahead of <span className="text-cyan-600">Outbreaks</span>
        </h2>

        <p className="text-slate-600 mb-8">
          Join thousands using VitalWatch for real-time health intelligence.
        </p>

        <button onClick={() => navigate("/signup")}
          className="px-8 py-4 rounded-xl font-bold bg-cyan-500 text-white hover:bg-cyan-600 transition">
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-10 py-8 bg-white">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="font-bold text-sm">VitalWatch</span>
          <p className="text-xs text-slate-500">© 2026 · Health data platform</p>
        </div>
      </footer>
    </div>
  );
}