import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { errorMessage } from "../services/api";
import Loading, { ErrorBox, Empty } from "../components/Loading";
import { BOOKING_STATUS, formatDateTime, formatMoney } from "../utils/format";

export default function MyBookingsPage() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  const load = () => bookingService.mine().then(setList).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const cancel = async (b) => {
    const msg = b.status === "CONFIRMED" ? "Hủy vé đã thanh toán? (chỉ được hủy trước giờ chiếu 2 tiếng, sẽ hoàn tiền)" : "Hủy đặt vé này?";
    if (!window.confirm(msg)) return;
    setError("");
    try { await bookingService.cancel(b.id); await load(); } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold">Vé của tôi</h1>
      <div className="mt-4"><ErrorBox message={error} /></div>
      <div className="mt-4 space-y-4">
        {!list ? <Loading /> : list.length === 0 ? (
          <Empty>Bạn chưa đặt vé nào. <Link to="/movies" className="font-semibold text-velvet">Chọn phim ngay</Link></Empty>
        ) : list.map((b) => {
          const st = BOOKING_STATUS[b.status];
          return (
            <div key={b.id} className="ticket" style={{ "--cut": "100%" }}>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  <h2 className="mt-1 text-xl font-extrabold">{b.movieTitle}</h2>
                  <p className="text-sm text-muted">{b.cinemaName} · {b.roomName} · {formatDateTime(b.startTime)}</p>
                  <p className="text-sm">Ghế {b.seats.join(", ")} · <strong>{formatMoney(b.totalAmount)}</strong> · <span className="font-mono">{b.bookingCode}</span></p>
                </div>
                <div className="flex gap-2">
                  {b.status === "PENDING" && <Link to={`/payment/${b.id}`} className="btn-primary btn-sm">Tiếp tục thanh toán</Link>}
                  {b.status === "CONFIRMED" && <Link to={`/payment/${b.id}`} className="btn-dark btn-sm">Xem vé</Link>}
                  {(b.status === "PENDING" || b.status === "CONFIRMED") && <button className="btn-ghost btn-sm" onClick={() => cancel(b)}>Hủy</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
