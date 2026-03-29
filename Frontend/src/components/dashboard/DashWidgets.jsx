import { useState } from "react";
import { DISEASES, DATA_SOURCES, TRENDS, NOTIFICATIONS, MAP_DOTS } from "../../data/mockData";
import { CardBox, CardHeader, LiveBadge, SevDot } from "../ui";

export function DiseaseSidebar() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <CardBox>
        <CardHeader icon="📍" title="Your Location" />

        <div className="flex flex-col gap-2.5 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-500">
            <span className="text-sm text-cyan-600">🔍</span>
            <input
              defaultValue="Chandigarh, Punjab"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder-slate-400"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="mb-1.5 text-xs text-slate-500">Risk Level</p>

            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-emerald-500 to-yellow-500" />
              </div>
              <span className="text-xs font-bold text-yellow-600">Moderate</span>
            </div>
          </div>
        </div>
      </CardBox>

      <CardBox>
        <CardHeader icon="🦠" title="Disease Monitor" />

        <div className="flex flex-col gap-0.5 p-1.5">
          {DISEASES.map((disease) => (
            <button
              key={disease.id}
              onClick={() => setActive(disease.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                active === disease.id
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
        </div>
      </CardBox>
    </div>
  );
}

export function DataSourcesPanel() {
  return (
    <CardBox>
      <CardHeader icon="🌐" title="Data Sources" />

      {DATA_SOURCES.map((source, index) => (
        <div
          key={source.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 ${
            index < DATA_SOURCES.length - 1 ? "border-b border-slate-200" : ""
          }`}
        >
          <span>{source.icon}</span>

          <span className="flex-1 text-xs text-slate-600">
            {source.name}
          </span>

          <span
            className={`text-xs font-semibold ${
              source.status === "synced" ? "text-emerald-600" : "text-yellow-600"
            }`}
          >
            {source.status === "synced" ? "✓ Synced" : "⟳ Pending"}
          </span>
        </div>
      ))}
    </CardBox>
  );
}

export function OutbreakMap() {
  return (
    <CardBox>
      <CardHeader icon="🗺️" title="Outbreak Map" />

      <div className="relative h-40 overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,200,200,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(200,200,200,0.5) 1px,transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {MAP_DOTS.map((dot) => (
          <span
            key={dot.id}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              transform: "translate(-50%,-50%)",
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

export function WeeklyTrend() {
  return (
    <CardBox>
      <CardHeader icon="📈" title="Weekly Trend" />

      <div className="flex flex-col gap-3 p-3">
        {TRENDS.map((trend) => (
          <div key={trend.id} className="flex items-center gap-3">
            <span className="flex-1 text-xs text-slate-600">
              {trend.name}
            </span>

            <div className="flex h-5 items-end gap-0.5">
              {trend.bars.map((bar, index) => (
                <div
                  key={index}
                  className={`w-1 rounded ${trend.up ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ height: `${Math.round((bar / 14) * 20)}px` }}
                />
              ))}
            </div>

            <span className={`text-xs font-bold ${trend.up ? "text-red-600" : "text-emerald-600"}`}>
              {trend.pct}
            </span>
          </div>
        ))}
      </div>
    </CardBox>
  );
}

export function NotificationPanel() {
  return (
    <CardBox>
      <CardHeader icon="🔔" title="Notifications" right={<LiveBadge label="3 new" />} />

      <div className="flex flex-col gap-1.5 p-2">
        {NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition ${
              notification.urgent
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <span>{notification.icon}</span>

            <div className="flex-1">
              <p className={`text-xs font-semibold ${notification.urgent ? "text-red-600" : "text-slate-800"}`}>
                {notification.title}
              </p>

              <p className="text-xs text-slate-500">
                {notification.body}
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {notification.time}
            </span>
          </div>
        ))}
      </div>
    </CardBox>
  );
}

export function SOSButton({ onPress }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
      <button
        onClick={onPress}
        className="w-full rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600"
      >
        🚨 SOS Emergency
      </button>

      <p className="mt-2 text-xs text-slate-500">
        Tap for nearest help
      </p>
    </div>
  );
}

export function RightPanel({ onSOS, showSOS = true }) {
  return (
    <div className="flex flex-col gap-4">
      <OutbreakMap />
      <WeeklyTrend />
      {showSOS && <SOSButton onPress={onSOS} />}
    </div>
  );
}
