import { createContext, useContext, useState } from "react";
const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

 const login = async (email, password) => {
  try {
    let url = "http://localhost:6001/auth/login";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    const loggedInUser = data.data;
    console.log(data);
    
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
