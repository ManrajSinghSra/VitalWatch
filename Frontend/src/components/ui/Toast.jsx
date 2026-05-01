// src/components/ui/Toast.jsx
import { useState, useEffect, useCallback } from "react";

let _add = null;
export const toast = ({ icon = "ℹ️", title, body, urgent = false }) => _add?.({ icon, title, body, urgent, id: Date.now() });

export default function ToastContainer() {
  const [list, setList] = useState([]);
  const add = useCallback(t => {
    setList(p => [...p, t]);
    setTimeout(() => setList(p => p.filter(x => x.id !== t.id)), 4500);
  }, []);
  useEffect(() => { _add = add; return () => { _add = null; }; }, [add]);

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {list.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-night-2 shadow-xl pointer-events-auto max-w-xs animate-toastIn ${t.urgent ? "border-red-500/25" : "border-edge-2"}`}>
          <span className="text-base">{t.icon}</span>
          <div className="flex-1">
            <p className={`text-xs font-bold ${t.urgent ? "text-red-400" : "text-white"}`}>{t.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.body}</p>
          </div>
          <button onClick={() => setList(p => p.filter(x => x.id !== t.id))} className="text-slate-600 hover:text-slate-300 text-xs transition-colors">✕</button>
        </div>
      ))}
    </div>
  );
}
