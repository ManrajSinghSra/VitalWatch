import { useEffect, useState } from "react";
import { CardBox, CardHeader } from "./ui";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:6001";
export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/alerts`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error("alerts fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const urgencyStyle = {
    danger: { dot: "bg-red-500", border: "border-l-red-500", badge: "bg-red-100 text-red-700" },
    warning: { dot: "bg-amber-500", border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700" },
    success: { dot: "bg-emerald-500", border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    info: { dot: "bg-cyan-500", border: "border-l-cyan-500", badge: "bg-cyan-100 text-cyan-700" },
  };

  return (
    <CardBox>
      <CardHeader 
        title="Current Alerts" 
        right={<span className="text-xs text-slate-500">{alerts.length} active</span>}
      />
      
      {loading && (
        <div className="p-5 text-sm text-slate-500">Loading alerts…</div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="p-5 text-sm text-slate-500">
          No outbreak alerts yet. Upload reports to see alerts.
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
      {!loading && alerts.map((a) => {
        const style = urgencyStyle[a.urgency] || urgencyStyle.info;
        return (
          <div
            key={a.id}
            className={`flex items-start gap-3 border-b border-l-4 border-slate-200 ${style.border} px-4 py-3 last:border-b-0`}
          >
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${style.dot} flex-shrink-0`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-800">
                  {a.disease}
                </p>
                {a.isLatest && (
                  <span className="rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700">
                    NEW
                  </span>
                )}
              </div>
              
              <p className="mt-0.5 text-xs text-slate-600">
                {a.district && <span className="font-medium">{a.district}, </span>}
                <span>{a.state}</span>
                {a.week && <span className="text-slate-400"> · Wk {a.week}</span>}
              </p>
              
              <p className="mt-1 text-xs text-slate-700">
                {a.reason}
                {a.cases > 0 && a.deaths === 0 && (
                  <span className="text-slate-500"> across {a.cases} cases</span>
                )}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                {a.urgency.toUpperCase()}
              </span>
              {a.status && (
                <span className="text-[10px] text-slate-500">
                  {a.status}
                </span>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </CardBox>
  );
}