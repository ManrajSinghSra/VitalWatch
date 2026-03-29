import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { StatCard, Badge, CardBox, CardHeader, AvatarCircle, PrimaryBtn, GhostBtn, IconBtn } from "../../components/ui";
import { ADMIN_USERS, SUPERADMIN_SYSTEM, DATA_SOURCES } from "../../data/mockData";

const SA_TABS = [
  { key: "overview", label: "Overview",    icon: "👑" },
  { key: "users",    label: "All Users",   icon: "👥" },
  { key: "admins",   label: "Admins",      icon: "🛠️" },
  // { key: "system",   label: "System",      icon: "⚙️" },
  { key: "logs",     label: "Audit Logs",  icon: "📜" },
];

const ROLE_BADGE   = { user: "info", admin: "warn", superadmin: "purple" };
const STATUS_BADGE = { active: "success", inactive: "danger" };

const AUDIT_LOGS = [
  { id: 1, user: "Rahul Verma",    action: "Added new alert: Dengue Surge",        time: "5m ago",  level: "info"  },
  { id: 2, user: "Meera Joshi",    action: "Promoted Dev Kapoor to Admin",          time: "1h ago",  level: "warn"  },
  { id: 3, user: "System",         action: "IDSP Week 12 report auto-ingested",     time: "3h ago",  level: "info"  },
  { id: 4, user: "Rahul Verma",    action: "Deleted stale WHO Bulletin #44",        time: "5h ago",  level: "danger"},
  { id: 5, user: "System",         action: "Scheduled sync completed (4 sources)",  time: "6h ago",  level: "info"  },
  { id: 6, user: "Meera Joshi",    action: "Updated system notification settings",  time: "1d ago",  level: "info"  },
  { id: 7, user: "Dev Kapoor",     action: "Login from new device (Amritsar)",      time: "1d ago",  level: "warn"  },
];

const LOG_COLORS = {
  info:   "text-cyan-400 bg-cyan-400/8 border-cyan-400/15",
  warn:   "text-yellow-400 bg-yellow-400/8 border-yellow-400/15",
  danger: "text-red-400 bg-red-500/8 border-red-500/15",
};

const SYS_METRICS = [
  { label: "API Uptime",         value: "99.97%",  bar: 99,  color: "bg-emerald-400" },
  { label: "Storage Used",       value: "68%",     bar: 68,  color: "bg-yellow-400"  },
  { label: "AI Query Load",      value: "42%",     bar: 42,  color: "bg-cyan-400"    },
  { label: "Vector DB Health",   value: "100%",    bar: 100, color: "bg-emerald-400" },
  { label: "MongoDB Connection", value: "Active",  bar: 100, color: "bg-emerald-400" },
  { label: "RAG Pipeline",       value: "Online",  bar: 100, color: "bg-emerald-400" },
];

export default function SuperAdminDashboard() {
  const [tab, setTab]         = useState("overview");
  const [confirmId, setConfirm] = useState(null);

  const admins = ADMIN_USERS.filter(u => u.role === "admin" || u.role === "superadmin");
  const users  = ADMIN_USERS.filter(u => u.role === "user");

  return (
    <div className="min-h-screen bg-[#f4f9fd] flex flex-col"> 
      <div className="fixed top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full bg-purple-400/5 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-cyan-400/3 blur-[80px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar tabs={SA_TABS} activeTab={tab} onTabChange={setTab} />

        <div className="px-8 py-8 max-w-[1280px] mx-auto w-full flex-1">
 
          <div className="flex items-center justify-between mb-8 animate-fadeUp">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-400/8 border border-purple-400/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                👑 Super Admin — Full Control
              </div>
              <h1 className="font-black text-3xl text-black font-head tracking-tight">
                {tab === "overview" && "Platform Overview"}
                {tab === "users"   && "All Users"}
                {tab === "admins"  && "Admin Management"}
                {tab === "system"  && "System Health"}
                {tab === "logs"    && "Audit Logs"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">Full platform control — users, admins, system config, and audit trail.</p>
            </div>
            {tab === "admins" && <PrimaryBtn>+ Promote to Admin</PrimaryBtn>}
            {tab === "users"  && <PrimaryBtn>+ Add User</PrimaryBtn>}
          </div>
 
          {tab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeUp">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <StatCard icon="👥" label="Total Users"       value={SUPERADMIN_SYSTEM.totalUsers}        sub="+18 this week" accent="cyan"    />
                  <StatCard icon="🛠️" label="Total Admins"      value={SUPERADMIN_SYSTEM.admins}            sub="2 regions"     accent="yellow"  />
                  <StatCard icon="📋" label="Reports Processed" value={SUPERADMIN_SYSTEM.reportsProcessed} sub="+12 this week" accent="emerald" />
                  <StatCard icon="🤖" label="AI Queries (today)"value="8,421"                               sub="+31%"          accent="purple"  />
                  <StatCard icon="🌐" label="API Calls Total"   value={SUPERADMIN_SYSTEM.apiCalls}          sub="all time"      accent="cyan"    />
                  <StatCard icon="⚡" label="Uptime"            value={SUPERADMIN_SYSTEM.uptime}            sub="last 30d"      accent="emerald" />
                </div>

                
                {/* <CardBox>
                  <CardHeader icon="💻" title="System Health" right={<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />} />
                  <div className="p-4 flex flex-col gap-3">
                    {SYS_METRICS.map(m => (
                      <div key={m.label} className="flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">{m.label}</span>
                          <span className="text-xs font-bold text-white">{m.value}</span>
                        </div>
                        <div className="h-1 bg-edge rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.bar}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBox> */}

              </div>

               
              {/* <CardBox>
                <CardHeader icon="🌐" title="Data Source Pipeline" />
                <div className="grid grid-cols-4 gap-0 divide-x divide-edge">
                  {DATA_SOURCES.map(s => (
                    <div key={s.id} className="px-5 py-4 flex flex-col gap-2">
                      <span className="text-2xl">{s.icon}</span>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <Badge variant={s.status === "synced" ? "success" : "warn"}>{s.status}</Badge>
                      <p className="text-xs text-slate-500 mt-1">Last sync: {s.status === "synced" ? "2h ago" : "Pending"}</p>
                    </div>
                  ))}
                </div>
              </CardBox> */}

              
              <CardBox>
                <CardHeader icon="📜" title="Recent Activity" right={<GhostBtn onClick={() => setTab("logs")}>View All →</GhostBtn>} />
                <div className="flex flex-col">
                  {AUDIT_LOGS.slice(0, 4).map((l, i) => (
                    <div key={l.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-night-3 transition-colors ${i < 3 ? "border-b border-edge" : ""}`}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${LOG_COLORS[l.level]}`}>
                        {l.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-300 font-medium flex-1">{l.action}</span>
                      <span className="text-xs text-slate-500">{l.user}</span>
                      <span className="text-xs text-slate-600 w-14 text-right">{l.time}</span>
                    </div>
                  ))}
                </div>
              </CardBox>
            </div>
          )}

        
          {tab === "users" && (
            <div className="animate-fadeUp">
              <CardBox>
                <CardHeader icon="👥" title={`All Users (${ADMIN_USERS.length})`} right={
                  <div className="flex gap-2">
                    <GhostBtn>Export CSV</GhostBtn>
                    <PrimaryBtn className="text-xs py-1.5 px-3">+ Add User</PrimaryBtn>
                  </div>
                } />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-edge text-slate-500 text-left">
                        {["User", "Email", "Role", "Location", "Joined", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ADMIN_USERS.map((u, i) => (
                        <tr key={u.id} className={`border-b border-edge hover:bg-night-3 transition-colors ${i === ADMIN_USERS.length - 1 ? "border-0" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <AvatarCircle name={u.name} size="sm" />
                              <span className="font-medium text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>
                          <td className="px-4 py-3"><Badge variant={ROLE_BADGE[u.role]}>{u.role}</Badge></td>
                          <td className="px-4 py-3 text-slate-400">{u.location}</td>
                          <td className="px-4 py-3 text-slate-500">{u.joined}</td>
                          <td className="px-4 py-3"><Badge variant={STATUS_BADGE[u.status]}>{u.status}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 items-center">
                              <IconBtn title="Edit">✏️</IconBtn>
                              {u.role === "user" && <GhostBtn className="text-xs py-1 px-2">→ Admin</GhostBtn>}
                              <button
                                onClick={() => setConfirm(u.id)}
                                className="w-7 h-7 rounded-lg border border-red-500/20 flex items-center justify-center text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBox>

              
              {confirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-night-2 border border-edge rounded-2xl p-6 w-80 animate-fadeUp">
                    <p className="text-base font-bold text-white mb-2">Delete User?</p>
                    <p className="text-sm text-slate-400 mb-5">This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirm(null)} className="flex-1 py-2 rounded-lg border border-edge text-sm text-slate-400 hover:bg-night-3 transition-colors">Cancel</button>
                      <button onClick={() => setConfirm(null)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {tab === "admins" && (
            <div className="animate-fadeUp flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                {admins.map(a => (
                  <CardBox key={a.id}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <AvatarCircle name={a.name} size="md" />
                        <Badge variant={ROLE_BADGE[a.role]}>{a.role}</Badge>
                      </div>
                      <p className="font-bold text-white text-sm">{a.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {a.location}</p>
                      <div className="flex gap-2 mt-4">
                        <GhostBtn className="flex-1 text-xs py-1.5 justify-center">Edit Role</GhostBtn>
                        {a.role !== "superadmin" && (
                          <button className="flex-1 py-1.5 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/8 transition-colors">Demote</button>
                        )}
                      </div>
                    </div>
                  </CardBox>
                ))}

               
                <div className="bg-night-2 border border-dashed border-edge-2 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/3 transition-all duration-150 group">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-xl group-hover:scale-110 transition-transform">+</div>
                  <p className="text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">Promote User to Admin</p>
                </div>
              </div>
            </div>
          )}

          
          {/* {tab === "system" && (
            <div className="animate-fadeUp flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
               
                <CardBox>
                  <CardHeader icon="💻" title="Infrastructure Health" />
                  <div className="p-4 flex flex-col gap-4">
                    {SYS_METRICS.map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-slate-400">{m.label}</span>
                          <span className="text-xs font-bold text-white">{m.value}</span>
                        </div>
                        <div className="h-1.5 bg-edge rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width: `${m.bar}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBox>

                
                <CardBox>
                  <CardHeader icon="⚙️" title="System Configuration" />
                  <div className="p-4 flex flex-col gap-3">
                    {[
                      { label: "Auto-sync Data Sources",   val: true  },
                      { label: "AI RAG Pipeline",          val: true  },
                      { label: "Push Notifications",       val: true  },
                      { label: "Public Signup",            val: true  },
                      { label: "Maintenance Mode",         val: false },
                      { label: "Email Alerts for Admins",  val: true  },
                    ].map(cfg => (
                      <div key={cfg.label} className="flex items-center justify-between py-2 border-b border-edge last:border-0">
                        <span className="text-xs text-slate-300">{cfg.label}</span>
                        <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${cfg.val ? "bg-cyan-400/80" : "bg-edge-2"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${cfg.val ? "left-[18px]" : "left-0.5"}`} />
                        </div>
                      </div>
                    ))}
                    <PrimaryBtn className="w-full justify-center mt-2">Save Configuration</PrimaryBtn>
                  </div>
                </CardBox>
              </div>

              
              <CardBox>
                <CardHeader icon="☢️" title="Danger Zone" />
                <div className="p-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Force Re-sync All Sources", desc: "Triggers immediate data sync",      btn: "Run Sync",      color: "border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/5" },
                    { label: "Flush Vector DB Cache",     desc: "Clears all cached embeddings",      btn: "Flush Cache",   color: "border-orange-400/20 text-orange-400 hover:bg-orange-400/5" },
                    { label: "Reset AI Chat History",     desc: "Wipes all user conversation logs",  btn: "Reset Logs",    color: "border-red-500/20 text-red-400 hover:bg-red-500/5" },
                  ].map(d => (
                    <div key={d.label} className="bg-[#030a0f] border border-edge rounded-xl p-4 flex flex-col gap-2">
                      <p className="text-sm font-semibold text-white">{d.label}</p>
                      <p className="text-xs text-slate-500 flex-1">{d.desc}</p>
                      <button className={`mt-2 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors ${d.color}`}>{d.btn}</button>
                    </div>
                  ))}
                </div>
              </CardBox>
            </div>
          )} */}

          
          {tab === "logs" && (
            <div className="animate-fadeUp">
              <CardBox>
                <CardHeader icon="📜" title={`Audit Trail (${AUDIT_LOGS.length} entries)`} right={<GhostBtn>Export Logs</GhostBtn>} />
                <div className="flex flex-col">
                  {AUDIT_LOGS.map((l, i) => (
                    <div key={l.id} className={`flex items-start gap-4 px-4 py-3.5 hover:bg-night-3 transition-colors ${i < AUDIT_LOGS.length - 1 ? "border-b border-edge" : ""}`}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${LOG_COLORS[l.level]}`}>
                        {l.level.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{l.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <AvatarCircle name={l.user} size="sm" />
                          {l.user}
                        </p>
                      </div>
                      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">{l.time}</span>
                    </div>
                  ))}
                </div>
              </CardBox>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
