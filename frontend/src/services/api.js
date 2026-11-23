import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const api = axios.create({ baseURL: BASE_URL });

export const saveSession = (data) => {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
};
export const clearSession = () => ["accessToken", "refreshToken", "user"].forEach((k) => localStorage.removeItem(k));

export const errorMessage = (e) => e?.response?.data?.message || "Không thể kết nối máy chủ. Vui lòng thử lại.";

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("accessToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const canRefresh =
      err.response?.status === 401 && original && !original._retry &&
      localStorage.getItem("refreshToken") && !original.url.includes("/auth/");
    if (canRefresh) {
      original._retry = true;
      try {
        refreshing = refreshing || axios
          .post(`${BASE_URL}/auth/refresh`, { refreshToken: localStorage.getItem("refreshToken") })
          .finally(() => { refreshing = null; });
        const { data } = await refreshing;
        saveSession(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearSession();
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
