import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);

const API_URL = "http://localhost:6001";



export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const refreshUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.user) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } catch (err) {
        console.error(err.message);
      }
    };

    refreshUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const loggedInUser = data.user || data.data;

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

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setError("");
      return { ok: true, role: loggedInUser.role, user: loggedInUser };
    } catch (err) {
      console.error(err.message);
      setError("Server error");
      return { ok: false };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
