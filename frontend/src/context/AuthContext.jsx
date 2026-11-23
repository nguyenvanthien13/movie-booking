import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(async (email, password) => setUser(await authService.login(email, password)), []);
  const register = useCallback(async (payload) => setUser(await authService.register(payload)), []);
  const logout = useCallback(() => { authService.logout(); setUser(null); }, []);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "ADMIN", login, register, logout }),
    [user, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
