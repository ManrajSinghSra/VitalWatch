// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input, PrimaryBtn } from "../../components/ui";

const DEMO_ACCOUNTS = [
  { role: "Public User",  email: "user@demo.com",  password: "user123",  color: "text-cyan-400",   bg: "hover:border-cyan-400/40",   icon: "👤" },
  { role: "Admin",        email: "admin@demo.com", password: "admin123", color: "text-yellow-400", bg: "hover:border-yellow-400/40", icon: "🛠️" },
  { role: "Super Admin",  email: "super@demo.com", password: "super123", color: "text-purple-400", bg: "hover:border-purple-400/40", icon: "👑" },
];

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const res = login(email, password);
    setLoading(false);
    if (res.ok) {
      if (res.role === "superadmin") navigate("/superadmin");
      else if (res.role === "admin")  navigate("/admin");
      else                            navigate("/dashboard");
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Soft background accents */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-cyan-200/30 blur-[120px]" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-purple-200/30 blur-[100px]" />

      <div className="w-full max-w-md">
         
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
            🛡️
          </div>
          <h1 className="font-black text-3xl text-slate-800 tracking-tight">
            VitalWatch
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            AI Public Health Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800">Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your health intelligence dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
            
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon="✉️"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon="🔒"
            />

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠️ {error}
              </div>
            )}

            <PrimaryBtn
              type="submit"
              disabled={loading}
              className="w-full justify-center mt-1"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </PrimaryBtn>
          </form>

          <div className="px-8 pb-6">
            <p className="text-xs text-slate-500 text-center mb-3">
              — or try a demo account —
            </p>

            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <span>{acc.icon}</span>
                  <div className="flex-1 text-left">
                    <span className="text-xs font-bold text-slate-700">
                      {acc.role}
                    </span>
                    <p className="text-xs text-slate-500">
                      {acc.email}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    Fill →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
