import { useState } from "react";
import { DISEASES, DATA_SOURCES, TRENDS, NOTIFICATIONS, MAP_DOTS } from "../../data/mockData";
import { CardBox, CardHeader, LiveBadge, SevDot } from "../ui";

/* ── Sidebar ───────────────────────── */

export function DiseaseSidebar() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex flex-col gap-4">

      {/* Location */}
      <CardBox>
        <CardHeader icon="📍" title="Your Location" />

        <div className="p-3 flex flex-col gap-2.5">

          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-500">
            <span className="text-cyan-600 text-sm">🔍</span>
            <input
              defaultValue="Chandigarh, Punjab"
              className="bg-transparent outline-none text-slate-800 text-xs w-full placeholder-slate-400"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-500 mb-1.5">Risk Level</p>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                <div className="h-full w-[45%] bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full" />
              </div>
              <span className="text-xs font-bold text-yellow-600">Moderate</span>
            </div>
          </div>

        </div>
      </CardBox>

      {/* Disease list */}
      <CardBox>
        <CardHeader icon="🦠" title="Disease Monitor" />

        <div className="p-1.5 flex flex-col gap-0.5">
          {DISEASES.map(d => (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border w-full text-left transition
              ${
                active === d.id
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                  : "border-transparent hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${d.dot}`} />
              <span className="text-xs font-medium flex-1">{d.name}</span>

              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {d.cases}
              </span>
            </button>
          ))}
        </div>
      </CardBox>

      {/* Sources */}
      <CardBox>
        <CardHeader icon="🌐" title="Data Sources" />

        {DATA_SOURCES.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 ${
              i < DATA_SOURCES.length - 1 ? "border-b border-slate-200" : ""
            }`}
          >
            <span>{s.icon}</span>

            <span className="text-xs text-slate-600 flex-1">
              {s.name}
            </span>

            <span className={`text-xs font-semibold ${
              s.status === "synced" ? "text-emerald-600" : "text-yellow-600"
            }`}>
              {s.status === "synced" ? "✓ Synced" : "⟳ Pending"}
            </span>
          </div>
        ))}
      </CardBox>

    </div>
  );
}

/* ── Map ───────────────────────── */

export function OutbreakMap() {
  return (
    <CardBox>
      <CardHeader icon="🗺️" title="Outbreak Map" />

      <div className="relative h-40 bg-slate-100 overflow-hidden">

        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,200,200,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(200,200,200,0.5) 1px,transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        {MAP_DOTS.map(d => (
          <span
            key={d.id}
            className="absolute rounded-full"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              background: d.color,
              transform: "translate(-50%,-50%)"
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <p className="text-xs text-slate-500">Interactive map</p>
        </div>
      </div>
    </CardBox>
  );
}

/* ── Trends ───────────────────────── */

export function WeeklyTrend() {
  return (
    <CardBox>
      <CardHeader icon="📈" title="Weekly Trend" />

      <div className="p-3 flex flex-col gap-3">
        {TRENDS.map(t => (
          <div key={t.id} className="flex items-center gap-3">

            <span className="text-xs text-slate-600 flex-1">
              {t.name}
            </span>

            <div className="flex items-end gap-0.5 h-5">
              {t.bars.map((b, i) => (
                <div
                  key={i}
                  className={`w-1 rounded ${t.up ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ height: `${Math.round((b / 14) * 20)}px` }}
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
  );
}

/* ── Notifications ───────────────────────── */

export function NotificationPanel() {
  return (
    <CardBox>
      <CardHeader icon="🔔" title="Notifications" right={<LiveBadge label="3 new" />} />

      <div className="p-2 flex flex-col gap-1.5">
        {NOTIFICATIONS.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition
            ${
              n.urgent
                ? "bg-red-50 border-red-200"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{n.icon}</span>

            <div className="flex-1">
              <p className={`text-xs font-semibold ${
                n.urgent ? "text-red-600" : "text-slate-800"
              }`}>
                {n.title}
              </p>

              <p className="text-xs text-slate-500">
                {n.body}
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {n.time}
            </span>
          </div>
        ))}
      </div>
    </CardBox>
  );
}

/* ── SOS ───────────────────────── */

export function SOSButton({ onPress }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">

      <button
        onClick={onPress}
        className="w-full py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition"
      >
        🚨 SOS Emergency
      </button>

      <p className="text-xs text-slate-500 mt-2">
        Tap for nearest help
      </p>

    </div>
  );
}

/* ── Right Panel ───────────────────────── */

export function RightPanel({ onSOS }) {
  return (
    <div className="flex flex-col gap-4">
      <OutbreakMap />
      <WeeklyTrend />
      {/* <NotificationPanel /> */}
      <SOSButton onPress={onSOS} />
    </div>
  );
}