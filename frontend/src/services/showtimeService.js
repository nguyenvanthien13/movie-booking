import api from "./api";

export const showtimeService = {
  search: (params) => api.get("/showtimes", { params }).then((r) => r.data),
  get: (id) => api.get(`/showtimes/${id}`).then((r) => r.data),
  seats: (id) => api.get(`/showtimes/${id}/seats`).then((r) => r.data),
  cinemas: () => api.get("/cinemas").then((r) => r.data),
  rooms: (cinemaId) => api.get(`/cinemas/${cinemaId}/rooms`).then((r) => r.data),
};
