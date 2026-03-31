// src/pages/auth/SignupPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, PrimaryBtn } from "../../components/ui";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", location: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("http://localhost:6001/auth/register", {
      method: "POST",
      credentials:"include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword:form.confirm,
        location: form.location,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }
    console.log("Created user:", data.data);
    navigate("/login");

  } catch (err) {
    console.error(err.message);
    setErrors({ api: err.message });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden py-12">

      {/* Soft background accents */}
      <div className="fixed top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-emerald-200/40 blur-[120px]" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-cyan-200/40 blur-[100px]" />

      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
            🛡️
          </div>
          <h1 className="font-black text-3xl text-slate-800 tracking-tight">
            Join VitalWatch
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Get real-time health alerts for your area
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          
          <div className="px-8 py-5 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800">
              Create Account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Free access for public health awareness
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
            
            <Input
              label="Full Name"
              value={form.name}
              onChange={set("name")}
              placeholder="Priya Sharma"
              icon="👤"
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              icon="✉️"
              error={errors.email}
            />

            <Input
              label="City / District"
              value={form.location}
              onChange={set("location")}
              placeholder="Chandigarh, Punjab"
              icon="📍"
              error={errors.location}
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min 6 characters"
              icon="🔒"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Re-enter password"
              icon="🔒"
              error={errors.confirm}
            />

            {/* Role note */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-3 py-2.5 text-xs text-slate-600">
              📌 New accounts are created as{" "}
              <span className="text-cyan-700 font-semibold">
                Public User
              </span>. Admin roles are assigned by Super Admin.
            </div>

            <PrimaryBtn
              type="submit"
              disabled={loading}
              className="w-full justify-center mt-1"
            >
              {loading ? "Creating account…" : "Create Account →"}
            </PrimaryBtn>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}