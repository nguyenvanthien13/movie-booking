import api from "./api";

export const movieService = {
  list: (params) => api.get("/movies", { params }).then((r) => r.data),
  nowShowing: () => api.get("/movies/now-showing").then((r) => r.data),
  upcoming: () => api.get("/movies/upcoming").then((r) => r.data),
  get: (id) => api.get(`/movies/${id}`).then((r) => r.data),
  create: (m) => api.post("/admin/movies", m).then((r) => r.data),
  update: (id, m) => api.put(`/admin/movies/${id}`, m).then((r) => r.data),
  remove: (id) => api.delete(`/admin/movies/${id}`),
};
