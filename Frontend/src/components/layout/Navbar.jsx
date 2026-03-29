// src/components/layout/Navbar.jsx
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AvatarCircle } from "../ui";

const ROLE_META = {
  user:       { label: "Public User",  color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/20"    },
  admin:      { label: "Admin",        color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20" },
  superadmin: { label: "Super Admin",  color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20" },
};

export default function Navbar({ tabs = [], activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const meta = user ? ROLE_META[user.role] : null;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 bg-[#030a0f]/90 backdrop-blur-xl border-b border-edge">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-sm">🛡️</div>
        <span className="font-black text-xl tracking-tight font-head text-white">
          Vital<span className="text-cyan-400">Watch</span>
        </span>
        {meta && (
          <span className={`hidden md:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ml-1`}>
            {meta.label}
          </span>
        )}
      </div>

      {/* Tab Links */}
      {tabs.length > 0 && (
        <div className="hidden md:flex items-center gap-1">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onTabChange?.(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? "text-cyan-400 bg-cyan-400/10"
                  : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      )}

      {/* Right: Live + User */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live
        </div>

        {user && (
          <div className="flex items-center gap-2 group relative">
            <AvatarCircle name={user.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
              <p className={`text-xs ${meta.color}`}>{meta.label}</p>
            </div>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-44 bg-night-2 border border-edge rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl z-50">
              <div className="px-3 py-2.5 border-b border-edge">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/8 transition-colors">
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
