// src/pages/auth/UnauthorizedPage.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) navigate("/login");
    else if (user.role === "superadmin") navigate("/superadmin");
    else if (user.role === "admin")      navigate("/admin");
    else                                 navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030a0f] flex items-center justify-center px-4">
      <div className="fixed top-0 left-0 w-full h-full bg-red-500/3 pointer-events-none" />
      <div className="text-center animate-fadeUp">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="font-black text-4xl text-white font-head tracking-tight mb-3">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          You don't have permission to view this page. Your role doesn't allow access to this section.
        </p>
        <button
          onClick={goHome}
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-cyan-600 text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_35px_rgba(0,212,255,0.4)] transition-all duration-200"
        >
          ← Back to My Dashboard
        </button>
      </div>
    </div>
  );
}
