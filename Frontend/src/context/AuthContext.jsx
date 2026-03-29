import { createContext, useContext, useState } from "react";

// ── Mock user accounts ──────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: "Priya Sharma",  email: "user@demo.com",       password: "user123",   role: "user",       avatar: "PS", location: "Chandigarh" },
  { id: 2, name: "Rahul Verma",   email: "admin@demo.com",      password: "admin123",  role: "admin",      avatar: "RV", location: "Delhi"      },
  { id: 3, name: "Dr. Meera Joshi", email: "super@demo.com",    password: "super123",  role: "superadmin", avatar: "MJ", location: "New Delhi"  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      setError("");
      return { ok: true, role: found.role };
    }
    setError("Invalid email or password.");
    return { ok: false };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
