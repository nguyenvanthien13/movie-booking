import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showtimeService } from "../services/showtimeService";
import { bookingService } from "../services/bookingService";
import { errorMessage } from "../services/api";
import { useBooking, MAX_SEATS } from "../hooks/useBooking";
import SeatMap from "../components/SeatMap";
import Loading, { ErrorBox } from "../components/Loading";
import { formatDateTime, formatMoney } from "../utils/format";

export default function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { selectedIds, selectedSeats, total, toggle, pruneUnavailable, limitHit } = useBooking(seats);

  const loadSeats = useCallback(async () => {
    const fresh = await showtimeService.seats(showtimeId);
    setSeats(fresh);
    return fresh;
  }, [showtimeId]);

  useEffect(() => {
    Promise.all([showtimeService.get(showtimeId), loadSeats()])
      .then(([st]) => setShowtime(st))
      .catch((e) => setError(errorMessage(e)));
  }, [showtimeId, loadSeats]);

  // Làm mới sơ đồ ghế mỗi 15 giây để thấy ghế người khác vừa giữ/mua
  useEffect(() => {
    const t = setInterval(() => loadSeats().then(pruneUnavailable).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, [loadSeats, pruneUnavailable]);

  const confirm = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      const booking = await bookingService.create(Number(showtimeId), selectedIds);
      navigate(`/payment/${booking.id}`);
    } catch (e) {
      setError(errorMessage(e));
      if (e.response?.status === 409) {
        const fresh = await loadSeats().catch(() => null);
        if (fresh) { pruneUnavailable(fresh); setNotice("Sơ đồ ghế đã được cập nhật. Hãy chọn lại ghế khác."); }
      }
    } finally { setBusy(false); }
  };

  if (!showtime || !seats) return error ? <ErrorBox message={error} /> : <Loading />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section>
        <Link to={`/movies/${showtime.movieId}/showtimes`} className="text-sm text-muted hover:text-ink">← Chọn suất khác</Link>
        <h1 className="mt-1 text-3xl font-extrabold">Chọn ghế</h1>
        <div className="card mt-5 p-5"><SeatMap seats={seats} selectedIds={selectedIds} onToggle={toggle} /></div>
        {limitHit && <p className="mt-3 text-sm text-velvet">Bạn chỉ có thể chọn tối đa {MAX_SEATS} ghế cho mỗi lần đặt.</p>}
      </section>

      <aside>
        <div className="ticket lg:sticky lg:top-20" style={{ "--cut": "58%" }}>
          <div className="p-5 pb-6">
            <p className="text-xs text-muted">{showtime.cinemaName} · {showtime.roomName} ({showtime.roomType})</p>
            <h2 className="mt-1 text-2xl font-extrabold">{showtime.movieTitle}</h2>
            <p className="mt-1 text-sm">{formatDateTime(showtime.startTime)}</p>
          </div>
          <div className="ticket-perf p-5">
            <p className="text-sm text-muted">Ghế đã chọn</p>
            <p className="min-h-6 font-semibold">{selectedSeats.length ? selectedSeats.map((s) => s.seatNumber).join(", ") : "Chưa chọn ghế"}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm text-muted">Tổng tiền</span>
              <span className="font-display text-2xl font-extrabold">{formatMoney(total)}</span>
            </div>
            {notice && <p className="mt-3 text-sm text-amber-800">{notice}</p>}
            <div className="mt-3"><ErrorBox message={error} /></div>
            <button className="btn-primary mt-4 w-full" disabled={!selectedIds.length || busy} onClick={confirm}>
              {busy ? "Đang giữ ghế..." : "Giữ ghế và thanh toán"}
            </button>
            <p className="mt-2 text-xs text-muted">Ghế được giữ trong 10 phút để bạn hoàn tất thanh toán.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
