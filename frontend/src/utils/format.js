const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
export const formatMoney = (v) => money.format(Number(v ?? 0));

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });

export const formatDateTime = (iso) => `${formatTime(iso)} · ${formatDate(iso)}`;

/** yyyy-MM-dd theo giờ địa phương (không dùng toISOString để tránh lệch múi giờ) */
export const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const MOVIE_STATUS = { NOW_SHOWING: "Đang chiếu", UPCOMING: "Sắp chiếu", ENDED: "Đã kết thúc" };
export const BOOKING_STATUS = {
  PENDING: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-900" },
  CONFIRMED: { label: "Đã thanh toán", cls: "bg-emerald-100 text-emerald-900" },
  CANCELLED: { label: "Đã hủy", cls: "bg-slate-200 text-slate-700" },
  EXPIRED: { label: "Hết hạn giữ ghế", cls: "bg-slate-200 text-slate-700" },
};
