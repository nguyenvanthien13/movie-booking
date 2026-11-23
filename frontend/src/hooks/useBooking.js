import { useCallback, useMemo, useState } from "react";

export const MAX_SEATS = 8;

/** Quản lý danh sách ghế đang chọn + tổng tiền cho trang đặt vé. */
export function useBooking(seats) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [limitHit, setLimitHit] = useState(false);

  const toggle = useCallback((seat) => {
    setLimitHit(false);
    setSelectedIds((cur) => {
      if (cur.includes(seat.id)) return cur.filter((id) => id !== seat.id);
      if (cur.length >= MAX_SEATS) { setLimitHit(true); return cur; }
      return [...cur, seat.id];
    });
  }, []);

  /** Bỏ các ghế đã bị người khác lấy mất (sau khi tải lại sơ đồ). */
  const pruneUnavailable = useCallback((freshSeats) => {
    const ok = new Set(freshSeats.filter((s) => s.status === "AVAILABLE").map((s) => s.id));
    setSelectedIds((cur) => cur.filter((id) => ok.has(id)));
  }, []);

  const selectedSeats = useMemo(
    () => (seats || []).filter((s) => selectedIds.includes(s.id)),
    [seats, selectedIds]
  );
  const total = useMemo(() => selectedSeats.reduce((sum, s) => sum + Number(s.price), 0), [selectedSeats]);

  return { selectedIds, selectedSeats, total, toggle, pruneUnavailable, limitHit, clear: () => setSelectedIds([]) };
}
