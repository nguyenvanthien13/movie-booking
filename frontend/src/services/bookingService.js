import api from "./api";

export const bookingService = {
  create: (showtimeId, seatIds) => api.post("/bookings", { showtimeId, seatIds }).then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  mine: () => api.get("/bookings/my-bookings").then((r) => r.data),
  cancel: (id) => api.post(`/bookings/${id}/cancel`).then((r) => r.data),
  ticket: (id) => api.get(`/bookings/${id}/ticket`).then((r) => r.data),
  pay: (bookingId, paymentMethod, simulateFailure) =>
    api.post("/payments", { bookingId, paymentMethod, simulateFailure }).then((r) => r.data),
};
