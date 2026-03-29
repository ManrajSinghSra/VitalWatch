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

 const login = async (email, password, role) => {
  try {
    let url = "";

    if (role === "User") {
        url = "http://localhost:6001/user/loginUser";
      } else if (role === "Super") {
        url = "http://localhost:6001/user/loginSuper";
      } else {
        url = "http://localhost:6001/user/loginUser";
      }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    const loggedInUser = data.user || data.admin || data.data;

    if (!response.ok) {
      setError(data.message || "Login failed");
      return { ok: false };
    }

    if (!loggedInUser) {
      setError("Login response is missing user data");
      return { ok: false };
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(loggedInUser);

    setError("");
    return { ok: true, role: loggedInUser.role,data };
  } catch (err) {
    console.log(err.message);
    
    setError("Server error");
    return { ok: false };
  }
};

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
