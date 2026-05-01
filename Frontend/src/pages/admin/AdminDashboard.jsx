import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { StatCard, Badge, CardBox, CardHeader, AvatarCircle, PrimaryBtn, GhostBtn } from "../../components/ui";

const API_URL = "http://localhost:6001";

const ADMIN_TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "reports", label: "Reports", icon: "📋" },
  { key: "alerts", label: "Alerts", icon: "🚨" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [report,setReport]=useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const apiFetch = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const getAllReports=async()=>{
    const response = await apiFetch("/admin/report/all");
    setReport(response.reports || []);
  };

  const getAllUsers=async()=>{
    const response = await apiFetch("/admin/users");
    setUsers(response.users || []);
  };

  const loadAdminData = async () => {
    try {
      setError("");
      await Promise.all([getAllReports(), getAllUsers()]);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(()=>{
    loadAdminData()
  },[])
 

  const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
        await apiFetch("/admin/report/upload", {
          method: "POST",
          body: formData,
        });

        await getAllReports();
        e.target.value = "";
        } catch (err) {
          setError(err.message);
        }
    };

  const updateReportStatus = async (id, status) => {
    try {
      setError("");
      await apiFetch(`/admin/report/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
        await getAllReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      setError("");
      await apiFetch(`/admin/report/${id}`, { method: "DELETE" });
      await getAllReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadReport = (id) => {
    window.open(`${API_URL}/admin/report/download/${id}`, "_blank");
  };

  const sourceRows = [...new Map(report.map((item) => [item.source || "Other", item])).keys()].map((source) => ({
    source,
    count: report.filter((item) => (item.source || "Other") === source).length,
  }));

  const statusRows = ["uploaded", "processing", "processed", "failed"].map((status) => ({
    status,
    count: report.filter((item) => item.status === status).length,
  }));

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

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
 
        {tab === "overview" && (
          <div className="flex flex-col gap-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Users" value={users.length} accent="cyan" />
              <StatCard label="Alerts" value="6" accent="red" />
              <StatCard label="Reports" value={report.length} accent="emerald" />
              <StatCard label="Sources" value={new Set(report.map((r) => r.source)).size || 0} accent="yellow" />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <CardBox>
                <CardHeader title="Reports by Source" />

                <div className="p-4 flex flex-col gap-3">
                  {sourceRows.map((row) => (
                    <div key={row.source} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 flex-1">{row.source}</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.min(100, row.count * 20)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-cyan-600">{row.count}</span>
                    </div>
                  ))}
                  {!sourceRows.length && <p className="text-sm text-slate-500">No reports uploaded yet.</p>}
                </div>
              </CardBox>

              <CardBox>
                <CardHeader title="Report Status" />

                {statusRows.map((row) => (
                  <div key={row.status} className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 last:border-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{row.status}</p>
                      <p className="text-xs text-slate-500">Current reports</p>
                    </div>
                    <Badge>{row.count}</Badge>
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
                {users.map(u => (
                  <tr key={u._id} className="border-b hover:bg-slate-50">
                    <td className="p-3 flex gap-2 items-center">
                      <AvatarCircle name={u.name} size="sm" />
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td><Badge>{u.role}</Badge></td>
                    <td><Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "active" : "banned"}</Badge></td>
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


            {report.map(r => (
              <div key={r._id || r.id} className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 last:border-0">
                
                <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                  📄
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{r.originalName}</p>
                  <p className="text-xs text-slate-500">{r.source}</p>
                </div>

                <Badge>{r.status}</Badge>
                <select
                  value={r.status}
                  onChange={(e) => updateReportStatus(r._id || r.id, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                >
                  {["uploaded", "processing", "processed", "failed"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <GhostBtn onClick={() => downloadReport(r._id || r.id)} className="px-3 py-1 text-xs">Download</GhostBtn>
                <button
                  onClick={() => deleteReport(r._id || r.id)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </CardBox>
        )}

      
        {tab === "alerts" && (
          <CardBox>
            <CardHeader title="Alerts" />

            {report.filter((item) => item.status === "processed").map(item => (
              <div key={item._id} className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 last:border-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex-1">
                  <p className="font-semibold">{item.originalName}</p>
                  <p className="text-xs text-slate-500">{item.source}</p>
                </div>
                <Badge>{item.status}</Badge>
              </div>
            ))}
            {!report.filter((item) => item.status === "processed").length && (
              <p className="p-4 text-sm text-slate-500">No processed reports yet.</p>
            )}
          </CardBox>
        )}

      </div>
    </div>
  );
}
