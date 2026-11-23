import api, { saveSession, clearSession } from "./api";

export const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data);
    return data.user;
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data);
    return data.user;
  },
  logout: clearSession,
  me: () => api.get("/auth/me").then((r) => r.data),
};
