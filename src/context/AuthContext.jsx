import { createContext, useContext, useState, useEffect } from "react";
import { searchUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("dotaburgers-user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("dotaburgers-user");
      }
    }
  }, []);

  async function login(username) {
    try {
      const userData = await searchUser(username);
      setUser(userData);
      localStorage.setItem("dotaburgers-user", JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err.message === "Usuario no encontrado") throw err;
      throw new Error("Error de conexión");
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("dotaburgers-user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
