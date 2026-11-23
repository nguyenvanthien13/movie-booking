import api from "./api";

export const adminService = {
  stats: (days = 14) => api.get("/admin/stats", { params: { days } }).then((r) => r.data),
  bookings: () => api.get("/admin/bookings", { params: { size: 100 } }).then((r) => r.data),
  users: () => api.get("/admin/users").then((r) => r.data),
  showtimes: () => api.get("/admin/showtimes").then((r) => r.data),
  createShowtime: (p) => api.post("/admin/showtimes", p).then((r) => r.data),
  removeShowtime: (id) => api.delete(`/admin/showtimes/${id}`),
  createCinema: (c) => api.post("/admin/cinemas", c).then((r) => r.data),
  removeCinema: (id) => api.delete(`/admin/cinemas/${id}`),
  createRoom: (r) => api.post("/admin/rooms", r).then((x) => x.data),
  removeRoom: (id) => api.delete(`/admin/rooms/${id}`),
};
