import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import ChatWindow from "../../components/chat/ChatWindow";
import { DiseaseSidebar, RightPanel } from "../../components/dashboard/DashWidgets";
import { ALERTS, HERO_STATS } from "../../data/mockData";
import { SevDot } from "../../components/ui";
import { toast } from "../../components/ui/Toast";

const USER_TABS = [
  { key: "chat", label: "AI Chat", icon: "🤖" },
  { key: "alerts", label: "Alerts", icon: "🚨" },
  { key: "map", label: "Disease Map", icon: "🗺️" },
  { key: "reports", label: "Reports", icon: "📊" },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("chat");

  useEffect(() => {
    const t1 = setTimeout(() =>
      toast({ icon: "🦟", title: "Dengue Alert", body: "Cases +24% in Mohali this week", urgent: true }), 1800);
    const t2 = setTimeout(() =>
      toast({ icon: "📊", title: "Week 12 Report", body: "IDSP bulletin processed & summarized" }), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      <Navbar tabs={USER_TABS} activeTab={tab} onTabChange={setTab} />

      {/* Hero */}
      <div className="px-8 py-8 max-w-[1280px] mx-auto w-full">
        <div className="flex items-start justify-between gap-6 flex-wrap">

          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase">
              ⚡ AI-Powered · IDSP · WHO · NCDC
            </div>

            <h1 className="font-black text-4xl leading-tight">
              Know What's <br />
              Spreading <span className="text-cyan-600">Near You</span>
            </h1>

            <p className="text-slate-600 text-sm mt-3 max-w-lg">
              Hey <span className="font-medium">{user?.name?.split(" ")[0]}</span> —
              Your region shows <span className="text-yellow-600 font-medium">moderate risk</span>.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            {HERO_STATS.map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <span className="text-xl font-bold text-cyan-600">{s.num}</span>
                <span className="block text-xs text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Alerts can be done at last  */}
        {/* <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          <div className="flex justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold">🚨 Active Disease Alerts</span>

            <span className="text-xs text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              ● Live
            </span>
          </div>

          <div className="flex overflow-x-auto divide-x">
            {ALERTS.map(a => (
              <div key={a.id} className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                <SevDot sev={a.sev} />
                <div>
                  <p className="text-xs font-semibold">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.cases} cases</p>
                </div>
              </div>
            ))}
          </div>

        </div> */}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[240px_1fr_260px] gap-4 px-8 pb-12 max-w-[1280px] mx-auto w-full flex-1">
        <DiseaseSidebar />
        <ChatWindow />
        <RightPanel onSOS={() =>
          toast({ icon: "🚨", title: "Emergency", body: "Connecting to helpline…", urgent: true })
        } />
      </div>

      {/* Disclaimer */}
      <div className="px-8 pb-8 max-w-[1280px] mx-auto w-full">
        <div className="flex gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <span className="text-yellow-600">⚠️</span>
          <p className="text-xs text-slate-600">
            <strong className="text-yellow-700">Disclaimer:</strong> This is not a diagnostic tool.
            Consult a healthcare provider.
          </p>
        </div>
      </div>

    </div>
  );
}