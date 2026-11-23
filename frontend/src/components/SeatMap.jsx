import { useMemo } from "react";

const cls = (seat, selected) => {
  if (seat.status === "BOOKED") return "seat seat-booked";
  if (seat.status === "HELD") return "seat seat-held";
  if (selected) return "seat seat-selected";
  return seat.seatType === "VIP" ? "seat seat-vip" : "seat";
};

const label = (seat) =>
  `Ghế ${seat.seatNumber}${seat.seatType === "VIP" ? " VIP" : ""}` +
  ({ BOOKED: ", đã đặt", HELD: ", đang được giữ" }[seat.status] || "");

export default function SeatMap({ seats, selectedIds, onToggle }) {
  const rows = useMemo(() => {
    const map = new Map();
    seats.forEach((s) => map.set(s.rowName, [...(map.get(s.rowName) || []), s]));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div>
      <div className="mx-auto max-w-md">
        <div className="screen-arc" aria-hidden="true" />
        <p className="mt-1 text-center text-xs text-muted">Màn hình</p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="mx-auto flex w-max flex-col gap-2">
          {rows.map(([row, list]) => (
            <div key={row} className="flex items-center gap-1.5">
              <span className="w-5 text-center text-xs font-semibold text-muted">{row}</span>
              {list.map((s) => (
                <button key={s.id} type="button" className={cls(s, selectedIds.includes(s.id))}
                  disabled={s.status !== "AVAILABLE"} aria-pressed={selectedIds.includes(s.id)}
                  aria-label={label(s)} title={`${s.seatNumber} — ${Number(s.price).toLocaleString("vi-VN")}đ`}
                  onClick={() => onToggle(s)}>
                  {s.columnNumber}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span className="seat !h-5 !w-5" /> Còn trống</li>
        <li className="flex items-center gap-1.5"><span className="seat seat-vip !h-5 !w-5" /> VIP</li>
        <li className="flex items-center gap-1.5"><span className="seat seat-selected !h-5 !w-5" /> Đang chọn</li>
        <li className="flex items-center gap-1.5"><span className="seat seat-held !h-5 !w-5" /> Đang được giữ</li>
        <li className="flex items-center gap-1.5"><span className="seat seat-booked !h-5 !w-5" /> Đã đặt</li>
      </ul>
    </div>
  );
}
