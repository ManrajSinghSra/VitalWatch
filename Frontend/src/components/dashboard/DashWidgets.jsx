import { useMemo, useState } from "react";
import { CardBox, CardHeader, LiveBadge } from "../ui";

const colors = ["bg-red-500", "bg-yellow-500", "bg-emerald-500", "bg-cyan-500", "bg-purple-500"];

function getReportText(report) {
  return `${report.originalName || ""} ${report.source || ""} ${report.description || ""}`.toLowerCase();
}

export function buildDiseaseSummary(reports = []) {
  const diseaseNames = ["dengue", "malaria", "cholera", "diarrhea", "diarrhoea", "hepatitis", "measles", "influenza", "typhoid", "covid"];
  const counts = new Map();

  reports.forEach((report) => {
    const text = getReportText(report);
    diseaseNames.forEach((name) => {
      if (text.includes(name)) counts.set(name, (counts.get(name) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      cases: count,
      dot: colors[index % colors.length],
    }));
}

export function buildSourceSummary(reports = []) {
  const counts = new Map();
  reports.forEach((report) => counts.set(report.source || "Other", (counts.get(report.source || "Other") || 0) + 1));
  return [...counts.entries()].map(([name, count]) => ({ id: name, name, count, status: "synced" }));
}

export function DiseaseSidebar({ reports = [], location = "" }) {
  const diseases = useMemo(() => buildDiseaseSummary(reports), [reports]);
  const [active, setActive] = useState("");
  const selected = active || diseases[0]?.id;

  return (
    <div className="flex flex-col gap-4">
      <CardBox>
        <CardHeader title="Your Location" />
        <div className="flex flex-col gap-2.5 p-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="mb-1.5 text-xs text-slate-500">Registered Location</p>
            <p className="text-sm font-semibold text-slate-700">{location || "Not set"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="mb-1.5 text-xs text-slate-500">Report Signals</p>
            <span className="text-xs font-bold text-cyan-600">{reports.length} uploaded reports</span>
          </div>
        </div>
      </CardBox>

      <CardBox>
        <CardHeader title="Disease Monitor" />
        <div className="flex flex-col gap-0.5 p-1.5">
          {diseases.map((disease) => (
            <button
              key={disease.id}
              onClick={() => setActive(disease.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                selected === disease.id
                  ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${disease.dot}`} />
              <span className="flex-1 text-xs font-medium">{disease.name}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-600">
                {disease.cases}
              </span>
            </button>
          ))}
          {!diseases.length && <p className="p-3 text-xs text-slate-500">No disease keywords found in uploaded reports yet.</p>}
        </div>
      </CardBox>
    </div>
  );
}

export function DataSourcesPanel({ reports = [] }) {
  const sources = useMemo(() => buildSourceSummary(reports), [reports]);

  return (
    <CardBox>
      <CardHeader title="Data Sources" />
      {sources.map((source, index) => (
        <div
          key={source.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 ${index < sources.length - 1 ? "border-b border-slate-200" : ""}`}
        >
          <span className="flex-1 text-xs text-slate-600">{source.name}</span>
          <span className="text-xs font-semibold text-emerald-600">{source.count} reports</span>
        </div>
      ))}
      {!sources.length && <p className="p-4 text-xs text-slate-500">No report sources yet.</p>}
    </CardBox>
  );
}

export function OutbreakMap({ reports = [] }) {
  const dots = reports.slice(0, 8).map((report, index) => ({
    id: report._id,
    top: `${22 + ((index * 17) % 55)}%`,
    left: `${24 + ((index * 23) % 54)}%`,
    size: 8 + Math.min(12, report.source?.length || 4),
    color: ["rgba(255,61,90,0.65)", "rgba(255,184,0,0.68)", "rgba(0,180,157,0.68)", "rgba(14,165,233,0.65)"][index % 4],
  }));

  return (
    <CardBox>
      <CardHeader title="Report Signal Map" />
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(rgba(200,200,200,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(200,200,200,0.5) 1px,transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {dots.map((dot) => (
          <span
            key={dot.id}
            className="absolute rounded-full"
            style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size, background: dot.color, transform: "translate(-50%,-50%)" }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <p className="text-xs text-slate-500">{reports.length ? "Signals from uploaded reports" : "No report signals yet"}</p>
        </div>
      </div>
    </CardBox>
  );
}

export function WeeklyTrend({ reports = [] }) {
  const trend = useMemo(() => {
    const byDay = new Map();
    reports.forEach((report) => {
      const day = new Date(report.createdAt).toLocaleDateString();
      byDay.set(day, (byDay.get(day) || 0) + 1);
    });
    return [...byDay.entries()].slice(0, 7);
  }, [reports]);

  return (
    <CardBox>
      <CardHeader title="Report Trend" />
      <div className="flex flex-col gap-3 p-3">
        {trend.map(([day, count]) => (
          <div key={day} className="flex items-center gap-3">
            <span className="flex-1 text-xs text-slate-600">{day}</span>
            <div className="flex h-5 items-end gap-0.5">
              <div className="w-2 rounded bg-cyan-500" style={{ height: `${Math.max(6, count * 8)}px` }} />
            </div>
            <span className="text-xs font-bold text-cyan-600">{count}</span>
          </div>
        ))}
        {!trend.length && <p className="text-xs text-slate-500">No report upload trend yet.</p>}
      </div>
    </CardBox>
  );
}

export function NotificationPanel({ reports = [] }) {
  const latest = reports.slice(0, 3);
  return (
    <CardBox>
      <CardHeader title="Notifications" right={<LiveBadge label={`${latest.length} latest`} />} />
      <div className="flex flex-col gap-1.5 p-2">
        {latest.map((report) => (
          <div key={report._id} className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50">
            <p className="text-xs font-semibold text-slate-800">{report.originalName}</p>
            <p className="text-xs text-slate-500">{report.source} · {report.status}</p>
          </div>
        ))}
        {!latest.length && <p className="p-2 text-xs text-slate-500">No notifications yet.</p>}
      </div>
    </CardBox>
  );
}

export function SOSButton({ onPress }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
      <button onClick={onPress} className="w-full rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600">
        SOS Emergency
      </button>
      <p className="mt-2 text-xs text-slate-500">Tap for nearest help</p>
    </div>
  );
}

export function RightPanel({ onSOS, showSOS = true, reports = [] }) {
  return (
    <div className="flex flex-col gap-4">
      <OutbreakMap reports={reports} />
      <WeeklyTrend reports={reports} />
      {showSOS && <SOSButton onPress={onSOS} />}
    </div>
  );
}
