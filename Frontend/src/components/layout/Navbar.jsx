import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AvatarCircle } from "../ui";
import BrandLogo from "./BrandLogo";

const ROLE_META = {
  user: { label: "Public User", color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" },
  admin: { label: "Admin", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  superadmin: { label: "Super Admin", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
};

export default function Navbar({ tabs = [], activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const meta = user ? ROLE_META[user.role] : null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-100/80 bg-cyan-50/80 px-6 py-4 shadow-[0_18px_60px_rgba(8,145,178,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button type="button" className="text-left" onClick={() => navigate("/")}>
          <BrandLogo />
        </button>

        {tabs.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 p-2 shadow-inner shadow-slate-100 lg:flex-nowrap">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange?.(key)}
                className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                  activeTab === key
                    ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {icon && <span className="text-xs">{icon}</span>}
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-600 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            LIVE
          </div>

          {user && (
            <div className="group relative flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
              <AvatarCircle name={user.name} size="sm" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight text-slate-800">{user.name}</p>
                <p className={`text-xs ${meta?.color || "text-slate-500"}`}>{meta?.label}</p>
              </div>

              <div className="invisible absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="border-b border-slate-200 px-3 py-2.5">
                  <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  {meta && (
                    <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
