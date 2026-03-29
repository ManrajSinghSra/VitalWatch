import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { StatCard, Badge, CardBox, CardHeader, AvatarCircle, PrimaryBtn, GhostBtn, IconBtn } from "../../components/ui";
import { ADMIN_USERS, ADMIN_REPORTS, ALERTS, TRENDS } from "../../data/mockData";

const ADMIN_TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "reports", label: "Reports", icon: "📋" },
  { key: "alerts", label: "Alerts", icon: "🚨" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
 

  const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        await fetch("/report/upload", {
          method: "POST",
          body: formData,
        });
        console.log("File uploaded");
    };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      <Navbar tabs={ADMIN_TABS} activeTab={tab} onTabChange={setTab} />

      <div className="px-8 py-8 max-w-[1280px] mx-auto w-full flex-1">
 
        <div className="flex justify-between mb-8">
          <div>
            <div className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-3 py-1 text-xs rounded-full inline-block mb-3">
              🛠️ Admin Panel
            </div>

            <h1 className="text-3xl font-bold">System Overview</h1>

            <p className="text-slate-600 text-sm">
              Manage users, reports, and alerts.
            </p>
          </div>

          <PrimaryBtn>+ Add Alert</PrimaryBtn>
        </div>
 
        {tab === "overview" && (
          <div className="flex flex-col gap-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Users" value="1,253" accent="cyan" />
              <StatCard label="Alerts" value="6" accent="red" />
              <StatCard label="Reports" value="2,847" accent="emerald" />
              <StatCard label="Sources" value="4" accent="yellow" />
            </div>

            {/* Trends + Alerts */}
            <div className="grid grid-cols-2 gap-4">

              <CardBox>
                <CardHeader title="Disease Trends" />

                <div className="p-4 flex flex-col gap-3">
                  {TRENDS.map(t => (
                    <div key={t.id} className="flex items-center gap-3">

                      <span className="text-sm text-slate-600 flex-1">
                        {t.name}
                      </span>

                      <div className="flex items-end gap-0.5 h-5">
                        {t.bars.map((b, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded ${
                              t.up ? "bg-red-500" : "bg-emerald-500"
                            }`}
                            style={{ height: `${(b / 14) * 20}px` }}
                          />
                        ))}
                      </div>

                      <span className={`text-xs font-bold ${
                        t.up ? "text-red-600" : "text-emerald-600"
                      }`}>
                        {t.pct}
                      </span>

                    </div>
                  ))}
                </div>
              </CardBox>

              <CardBox>
                <CardHeader title="Current Alerts" />

                {ALERTS.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 last:border-0">

                    <span className={`w-2 h-2 rounded-full ${
                      a.sev === "high"
                        ? "bg-red-500"
                        : a.sev === "medium"
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    }`} />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.location}</p>
                    </div>

                    <Badge>{a.cases}</Badge>

                  </div>
                ))}
              </CardBox>

            </div>
          </div>
        )}
 
        {tab === "users" && (
          <CardBox>
            <CardHeader title="Users" />

            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {ADMIN_USERS.map(u => (
                  <tr key={u.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 flex gap-2 items-center">
                      <AvatarCircle name={u.name} size="sm" />
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td><Badge>{u.role}</Badge></td>
                    <td><Badge>{u.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBox>
        )}
 
        {tab === "reports" && (
          <CardBox>
            <input type="file"  id="fileInput" className="hidden"
              onChange={handleFileUpload}
            />

           <div className="flex justify-between items-center">
              <CardHeader title="Reports" />
              <PrimaryBtn onClick={()=>document.getElementById("fileInput").click()}>
                + Upload Report
              </PrimaryBtn>
          </div>


            {ADMIN_REPORTS.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 last:border-0">
                
                <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                  📄
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.source}</p>
                </div>

                <Badge>{r.status}</Badge>
              </div>
            ))}
          </CardBox>
        )}

      
        {tab === "alerts" && (
          <CardBox>
            <CardHeader title="Alerts" />

            {ALERTS.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 last:border-0">

                <span className={`w-2 h-2 rounded-full ${
                  a.sev === "high"
                    ? "bg-red-500"
                    : a.sev === "medium"
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`} />

                <div className="flex-1">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.location}</p>
                </div>

                <span className="text-sm font-bold">
                  {a.cases}
                </span>

              </div>
            ))}
          </CardBox>
        )}

      </div>
    </div>
  );
}