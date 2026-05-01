import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { AvatarCircle, Badge, CardBox, CardHeader, GhostBtn, PrimaryBtn, StatCard } from "../../components/ui";

const API_URL = "http://localhost:6001";

const SA_TABS = [
  { key: "overview", label: "Overview", icon: "Crown" },
  { key: "users", label: "All Users", icon: "Users" },
  { key: "admins", label: "Admins", icon: "Admin" },
  { key: "logs", label: "Audit Logs", icon: "Logs" },
];

const ROLE_BADGE = { user: "info", admin: "warn", superadmin: "purple" };
const LEVEL_BADGE = { INFO: "info", WARN: "warn", DANGER: "danger" };

const defaultStats = {
  totalUsers: 0,
  totalAdmins: 0,
  reportsProcessed: 0,
  aiQueriesToday: 0,
  apiCallsTotal: 0,
  uptime: "0h 0m 0s",
};

const getToken = () => localStorage.getItem("token");

async function superAdminRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function UserTable({ users, onPromote, onDemote, onBanToggle, onDelete, busyId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            {["User", "Email", "Role", "Location", "Joined", "Status", "Actions"].map((heading) => (
              <th key={heading} className="px-4 py-3 font-semibold uppercase tracking-wider">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isBusy = busyId === user._id;
            const isAdmin = user.role === "admin";
            const isSuperAdmin = user.role === "superadmin";

            return (
              <tr key={user._id} className="border-b border-slate-200 transition-colors hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <AvatarCircle name={user.name} size="sm" />
                    <span className="font-medium text-slate-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={ROLE_BADGE[user.role] || "default"}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.location || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "active" : "banned"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!isSuperAdmin && !isAdmin && (
                      <GhostBtn onClick={() => onPromote(user._id)} className="px-2 py-1 text-xs" disabled={isBusy}>
                        Promote
                      </GhostBtn>
                    )}
                    {!isSuperAdmin && isAdmin && (
                      <GhostBtn onClick={() => onDemote(user._id)} className="px-2 py-1 text-xs" disabled={isBusy}>
                        Demote
                      </GhostBtn>
                    )}
                    {!isSuperAdmin && (
                      <GhostBtn onClick={() => onBanToggle(user)} className="px-2 py-1 text-xs" disabled={isBusy}>
                        {user.isActive ? "Ban" : "Unban"}
                      </GhostBtn>
                    )}
                    {!isSuperAdmin && (
                      <button
                        onClick={() => onDelete(user._id)}
                        disabled={isBusy}
                        className="rounded-lg border border-red-500/20 px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(defaultStats);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const admins = useMemo(() => users.filter((user) => user.role === "admin" || user.role === "superadmin"), [users]);
  const regularUsers = useMemo(() => users.filter((user) => user.role === "user"), [users]);

  const loadSuperAdminData = async () => {
    try {
      setError("");
      const [statsData, usersData, logsData] = await Promise.all([
        superAdminRequest("/superadmin/stats"),
        superAdminRequest("/superadmin/users"),
        superAdminRequest("/superadmin/audit-logs"),
      ]);

      setStats(statsData.stats || defaultStats);
      setUsers(usersData.users || []);
      setLogs(logsData.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const runUserAction = async (userId, path, options = {}) => {
    try {
      setBusyId(userId);
      setError("");
      await superAdminRequest(path, options);
      await loadSuperAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const promoteUser = (userId) =>
    runUserAction(userId, `/superadmin/promote/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        permissions: {
          canUploadReports: true,
          canManageAlerts: true,
          canViewUsers: true,
          canSendNotifications: true,
          canDeleteReports: false,
        },
      }),
    });

  const demoteUser = (userId) => runUserAction(userId, `/superadmin/demote/${userId}`, { method: "PATCH" });
  const toggleBan = (user) => runUserAction(user._id, `/superadmin/${user.isActive ? "ban" : "unban"}/${user._id}`, { method: "PATCH" });

  const deleteUser = (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    runUserAction(userId, `/superadmin/delete/${userId}`, { method: "DELETE" });
  };

  return (
    <div className="min-h-screen bg-[#f4f9fd] flex flex-col">
      <Navbar tabs={SA_TABS} activeTab={tab} onTabChange={setTab} />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
              Super Admin Full Control
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {tab === "overview" && "Platform Overview"}
              {tab === "users" && "All Users"}
              {tab === "admins" && "Admin Management"}
              {tab === "logs" && "Audit Logs"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Manage users, admin roles, access status, and audit trail.</p>
          </div>
          <PrimaryBtn onClick={loadSuperAdminData} disabled={loading}>
            Refresh
          </PrimaryBtn>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <CardBox>
            <div className="p-8 text-sm text-slate-500">Loading super admin data...</div>
          </CardBox>
        ) : (
          <>
            {tab === "overview" && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard label="Total Users" value={stats.totalUsers} sub="live DB count" accent="cyan" />
                  <StatCard label="Total Admins" value={stats.totalAdmins} sub="promoted users" accent="yellow" />
                  <StatCard label="Reports Processed" value={stats.reportsProcessed} sub="uploaded reports" accent="emerald" />
                  <StatCard label="AI Queries Today" value={stats.aiQueriesToday} sub="chat usage" accent="purple" />
                  <StatCard label="API Calls Total" value={stats.apiCallsTotal} sub="protected routes" accent="cyan" />
                  <StatCard label="Uptime" value={stats.uptime} sub="current process" accent="emerald" />
                </div>

                <CardBox>
                  <CardHeader title="Recent Activity" right={<GhostBtn onClick={() => setTab("logs")}>View All</GhostBtn>} />
                  <div className="flex flex-col">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log._id} className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-0">
                        <Badge variant={LEVEL_BADGE[log.level] || "default"}>{log.level}</Badge>
                        <span className="flex-1 text-sm text-slate-700">{log.action}</span>
                        <span className="text-xs text-slate-500">{log.performedBy}</span>
                        <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                      </div>
                    ))}
                    {!logs.length && <div className="p-4 text-sm text-slate-500">No audit logs yet.</div>}
                  </div>
                </CardBox>
              </div>
            )}

            {tab === "users" && (
              <CardBox>
                <CardHeader title={`All Users (${users.length})`} />
                <UserTable
                  users={users}
                  onPromote={promoteUser}
                  onDemote={demoteUser}
                  onBanToggle={toggleBan}
                  onDelete={deleteUser}
                  busyId={busyId}
                />
              </CardBox>
            )}

            {tab === "admins" && (
              <div className="grid gap-4 md:grid-cols-3">
                {admins.map((admin) => (
                  <CardBox key={admin._id}>
                    <div className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <AvatarCircle name={admin.name} size="md" />
                        <Badge variant={ROLE_BADGE[admin.role]}>{admin.role}</Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{admin.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{admin.email}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{admin.location || "No location"}</p>
                      {admin.role !== "superadmin" && (
                        <button
                          onClick={() => demoteUser(admin._id)}
                          disabled={busyId === admin._id}
                          className="mt-4 w-full rounded-lg border border-red-500/20 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          Demote to User
                        </button>
                      )}
                    </div>
                  </CardBox>
                ))}

                <CardBox>
                  <button
                    type="button"
                    onClick={() => setTab("users")}
                    className="flex min-h-[190px] w-full flex-col items-center justify-center gap-2 border border-dashed border-slate-300 p-5 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs font-semibold">Promote a User to Admin</span>
                  </button>
                </CardBox>
              </div>
            )}

            {tab === "logs" && (
              <CardBox>
                <CardHeader title={`Audit Trail (${logs.length})`} />
                <div className="flex flex-col">
                  {logs.map((log) => (
                    <div key={log._id} className="flex items-start gap-4 border-b border-slate-200 px-4 py-3.5 last:border-0">
                      <Badge variant={LEVEL_BADGE[log.level] || "default"}>{log.level}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700">{log.action}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <AvatarCircle name={log.performedBy} size="sm" />
                          {log.performedBy}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                  ))}
                  {!logs.length && <div className="p-4 text-sm text-slate-500">No audit logs yet.</div>}
                </div>
              </CardBox>
            )}
          </>
        )}
      </main>
    </div>
  );
}
