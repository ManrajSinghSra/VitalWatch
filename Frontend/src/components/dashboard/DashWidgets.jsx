import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CardBox, CardHeader, LiveBadge } from "../ui";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:6001";
const INDIA_GEOJSON_URL = "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

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

/* ─────────── OutbreakMap (Leaflet + real data from /dashboard/outbreaks-by-state) ─────────── */

const STATE_NAME_MAP = {
  "Orissa": "Odisha",
  "Pondicherry": "Puducherry",
  "Uttaranchal": "Uttarakhand",
  "Jammu & Kashmir": "Jammu and Kashmir",
  "Andaman & Nicobar Island": "Andaman and Nicobar Islands",
  "Dadara & Nagar Havelli": "Dadra and Nagar Haveli",
  "Daman & Diu": "Daman and Diu",
  "NCT of Delhi": "Delhi",
};

const normalizeStateName = (name) => STATE_NAME_MAP[name] || name;

const getCaseColor = (cases) => {
  if (!cases || cases === 0) return "#e2e8f0";
  if (cases < 50) return "#fef3c7";
  if (cases < 150) return "#fcd34d";
  if (cases < 300) return "#f59e0b";
  if (cases < 500) return "#ef4444";
  return "#b91c1c";
};

const FitBoundsOnce = ({ geojson }) => {
  const map = useMap();
  useEffect(() => {
    if (geojson && window.L) {
      const layer = window.L.geoJSON(geojson);
      map.fitBounds(layer.getBounds(), { padding: [10, 10] });
    }
  }, [geojson, map]);
  return null;
};

export function OutbreakMap() {
  const [geojson, setGeojson] = useState(null);
  const [stateData, setStateData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [stateDetail, setStateDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [geoRes, statsRes] = await Promise.all([
          fetch(INDIA_GEOJSON_URL),
          fetch(`${API_BASE}/dashboard/outbreaks-by-state`),
        ]);
        if (!geoRes.ok) throw new Error("map load failed");
        if (!statsRes.ok) throw new Error("stats load failed");

        const geoData = await geoRes.json();
        const statsData = await statsRes.json();
        if (cancelled) return;

        const byState = {};
        for (const s of statsData.states || []) byState[s._id] = s;

        setGeojson(geoData);
        setStateData(byState);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getStatsForFeature = (feature) => {
    const raw = feature?.properties?.NAME_1 || feature?.properties?.ST_NM || feature?.properties?.name;
    const name = normalizeStateName(raw);
    return { name, stats: stateData[name] };
  };

  const styleFeature = (feature) => {
    const { name, stats } = getStatsForFeature(feature);
    const cases = stats?.totalCases || 0;
    const isSelected = selectedState === name;
    return {
      fillColor: getCaseColor(cases),
      weight: isSelected ? 2 : 0.6,
      color: isSelected ? "#0891b2" : "#94a3b8",
      fillOpacity: 0.8,
    };
  };

  const onEachFeature = (feature, layer) => {
    const { name, stats } = getStatsForFeature(feature);
    const cases = stats?.totalCases || 0;
    const deaths = stats?.totalDeaths || 0;
    const outbreaks = stats?.totalOutbreaks || 0;

    layer.bindTooltip(
      `<div style="font-size:11px;line-height:1.4;font-family:system-ui">
        <strong>${name}</strong><br/>
        ${outbreaks} outbreak${outbreaks !== 1 ? "s" : ""} · ${cases} cases${deaths > 0 ? ` · ${deaths}†` : ""}
      </div>`,
      { sticky: true }
    );

    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 1.5, fillOpacity: 0.95 }),
      mouseout: (e) => e.target.setStyle({ weight: 0.6, fillOpacity: 0.8 }),
      click: async () => {
        setSelectedState(name);
        setStateDetail(null);
        try {
          const res = await fetch(`${API_BASE}/dashboard/state-detail/${encodeURIComponent(name)}`);
          if (res.ok) setStateDetail(await res.json());
        } catch (err) {
          console.error("state-detail failed:", err);
        }
      },
    });
  };

  return (
    <CardBox>
      <CardHeader title="Outbreak Signal Map" right={<LiveBadge label="live" />} />

      {loading && (
        <div className="flex h-40 items-center justify-center">
          <p className="text-xs text-slate-500">Loading map…</p>
        </div>
      )}

      {error && (
        <div className="flex h-40 items-center justify-center">
          <p className="text-xs text-red-500">⚠ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="relative h-72 overflow-hidden">
            <MapContainer
              center={[22.5, 80]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.25}
              />
              {geojson && (
                <>
                  <GeoJSON data={geojson} style={styleFeature} onEachFeature={onEachFeature} />
                  <FitBoundsOnce geojson={geojson} />
                </>
              )}
            </MapContainer>
          </div>

          {selectedState && (
            <div className="border-t border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{selectedState}</span>
                <button
                  onClick={() => { setSelectedState(null); setStateDetail(null); }}
                  className="text-xs text-slate-500 hover:text-cyan-600"
                >
                  ← back
                </button>
              </div>
              {!stateDetail ? (
                <p className="text-xs text-slate-500">Loading…</p>
              ) : (
                <div className="max-h-40 space-y-1.5 overflow-y-auto">
                  {(stateDetail.outbreaks || []).slice(0, 10).map((o) => (
                    <div key={o._id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{o.metadata?.disease || "Unknown"}</span>
                        <span className="text-slate-500">Wk {o.metadata?.weekNumber}</span>
                      </div>
                      <div className="mt-0.5 text-slate-600">
                        {o.metadata?.district || "—"} · {o.metadata?.cases || 0} cases
                        {o.metadata?.deaths > 0 && (
                          <span className="font-semibold text-red-600"> · {o.metadata.deaths}†</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2">
            <span className="text-[10px] text-slate-500">cases:</span>
            {[
              { c: "#e2e8f0", l: "0" },
              { c: "#fef3c7", l: "<50" },
              { c: "#fcd34d", l: "<150" },
              { c: "#f59e0b", l: "<300" },
              { c: "#ef4444", l: "<500" },
              { c: "#b91c1c", l: "500+" },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-sm" style={{ background: x.c }} />
                <span className="text-[10px] text-slate-500">{x.l}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </CardBox>
  );
}

/* ─────────── WeeklyTrend (Recharts + real data from /dashboard/outbreaks-by-week) ─────────── */

const TREND_COLORS = ["#0ea5e9", "#ef4444", "#10b981", "#f59e0b", "#a855f7"];

export function WeeklyTrend() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("cases");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard/outbreaks-by-week`);
        if (!res.ok) throw new Error("trend load failed");
        const data = await res.json();
        if (!cancelled) {
          setRawData(data.weeks || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { chartData, topDiseases } = useMemo(() => {
    if (rawData.length === 0) return { chartData: [], topDiseases: [] };

    const normalize = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    const displayName = {};

    const totals = {};
    for (const row of rawData) {
      const d = row._id.disease;
      if (!d) continue;
      const k = normalize(d);
      if (!displayName[k]) displayName[k] = d;
      totals[k] = (totals[k] || 0) + (row[metric] || 0);
    }

    const top = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => displayName[k]);
    const topNorm = top.map(normalize);

    const byWeek = {};
    for (const row of rawData) {
      const key = `${row._id.year}-W${row._id.week}`;
      if (!byWeek[key]) {
        byWeek[key] = { week: `W${row._id.week}`, year: row._id.year, weekNum: row._id.week };
        for (const d of top) byWeek[key][d] = 0;
      }
      const idx = topNorm.indexOf(normalize(row._id.disease));
      if (idx >= 0) byWeek[key][top[idx]] += row[metric] || 0;
    }

    const sorted = Object.values(byWeek).sort((a, b) => a.year - b.year || a.weekNum - b.weekNum);
    return { chartData: sorted, topDiseases: top };
  }, [rawData, metric]);

  return (
    <CardBox>
      <CardHeader
        title="Weekly Disease Trend"
        right={
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px]">
            {[
              { k: "cases", l: "Cases" },
              { k: "outbreaks", l: "Outbreaks" },
              { k: "deaths", l: "Deaths" },
            ].map((m) => (
              <button
                key={m.k}
                onClick={() => setMetric(m.k)}
                className={`rounded-md px-2 py-0.5 transition ${
                  metric === m.k ? "bg-white font-semibold text-slate-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-3">
        {loading && <p className="py-8 text-center text-xs text-slate-500">Loading trend…</p>}
        {error && <p className="py-8 text-center text-xs text-red-500">⚠ {error}</p>}
        {!loading && !error && chartData.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-500">
            Upload at least 2 weekly reports to see trends.
          </p>
        )}
        {!loading && !error && chartData.length > 0 && (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                {topDiseases.map((d, i) => (
                  <Line
                    key={d}
                    type="monotone"
                    dataKey={d}
                    stroke={TREND_COLORS[i % TREND_COLORS.length]}
                    strokeWidth={1.8}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </CardBox>
  );
}

/* ─────────── Notification + SOS + RightPanel (unchanged) ─────────── */

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
      <OutbreakMap />
      <WeeklyTrend />
      {showSOS && <SOSButton onPress={onSOS} />}
    </div>
  );
}