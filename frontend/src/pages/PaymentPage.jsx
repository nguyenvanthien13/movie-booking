import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { errorMessage } from "../services/api";
import Ticket from "../components/Ticket";
import Loading, { ErrorBox } from "../components/Loading";
import { formatDateTime, formatMoney } from "../utils/format";

const METHODS = [["ATM", "Thẻ ATM nội địa"], ["VISA", "Visa / Mastercard"], ["MOMO", "Ví MoMo"], ["VNPAY", "VNPay QR"]];

function useCountdown(expiresAt) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!expiresAt) { setLeft(null); return; }
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return left;
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [method, setMethod] = useState("VNPAY");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const b = await bookingService.get(bookingId);
    setBooking(b);
    if (b.status === "CONFIRMED") setTicket(await bookingService.ticket(bookingId));
    return b;
  }, [bookingId]);

  useEffect(() => { load().catch((e) => setError(errorMessage(e))); }, [load]);

  const left = useCountdown(booking?.status === "PENDING" ? booking.expiresAt : null);
  useEffect(() => { if (left === 0) load().catch(() => {}); }, [left, load]);

  const pay = async () => {
    setBusy(true); setError("");
    try {
      const p = await bookingService.pay(booking.id, method, simulateFailure);
      if (p.status === "FAILED") setError("Thanh toán không thành công. Ghế vẫn được giữ, bạn có thể thử lại trước khi hết thời gian.");
      await load();
    } catch (e) {
      setError(errorMessage(e));
      load().catch(() => {});
    } finally { setBusy(false); }
  };

  const cancel = async () => {
    if (!window.confirm("Hủy đặt vé và nhả ghế đang giữ?")) return;
    try { setBooking(await bookingService.cancel(booking.id)); } catch (e) { setError(errorMessage(e)); }
  };

  if (!booking) return error ? <ErrorBox message={error} /> : <Loading />;

  if (booking.status === "CONFIRMED" && ticket) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-extrabold">Đặt vé thành công</h1>
        <p className="mt-1 mb-6 text-muted">Đưa mã QR này cho nhân viên soát vé tại rạp.</p>
        <Ticket ticket={ticket} />
        <Link to="/my-bookings" className="btn-ghost mt-6">Xem tất cả vé của tôi</Link>
      </div>
    );
  }

  if (booking.status !== "PENDING") {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-extrabold">{booking.status === "EXPIRED" ? "Đã hết thời gian giữ ghế" : "Đơn đặt vé đã hủy"}</h1>
        <p className="mt-2 text-muted">Ghế đã được nhả cho người khác. Bạn có thể chọn lại suất chiếu.</p>
        <Link to={`/booking/${booking.showtimeId}`} className="btn-primary mt-5">Chọn ghế lại</Link>
      </div>
    );
  }

  const mm = String(Math.floor((left ?? 0) / 60)).padStart(2, "0");
  const ss = String((left ?? 0) % 60).padStart(2, "0");

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
      <div className="ticket" style={{ "--cut": "55%" }}>
        <div className="p-5 pb-6">
          <p className="text-xs text-muted">Mã đặt vé {booking.bookingCode}</p>
          <h2 className="mt-1 text-2xl font-extrabold">{booking.movieTitle}</h2>
          <p className="mt-1 text-sm">{booking.cinemaName} · {booking.roomName}</p>
          <p className="text-sm">{formatDateTime(booking.startTime)}</p>
        </div>
        <div className="ticket-perf p-5">
          <p className="text-sm text-muted">Ghế</p>
          <p className="font-semibold">{booking.seats.join(", ")}</p>
          <p className="mt-3 text-sm text-muted">Tổng thanh toán</p>
          <p className="font-display text-3xl font-extrabold">{formatMoney(booking.totalAmount)}</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold">Thanh toán</h1>
        <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900" role="timer">
          Ghế được giữ trong <strong className="font-mono">{mm}:{ss}</strong>
        </p>
        <fieldset className="mt-4 space-y-2">
          <legend className="label">Phương thức thanh toán</legend>
          {METHODS.map(([v, label]) => (
            <label key={v} className={`card flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm ${method === v ? "!border-velvet" : ""}`}>
              <input type="radio" name="method" checked={method === v} onChange={() => setMethod(v)} /> {label}
            </label>
          ))}
        </fieldset>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} />
          Demo: mô phỏng thanh toán thất bại
        </label>
        <div className="mt-3"><ErrorBox message={error} /></div>
        <button className="btn-primary mt-4 w-full" disabled={busy} onClick={pay}>{busy ? "Đang xử lý..." : `Thanh toán ${formatMoney(booking.totalAmount)}`}</button>
        <button className="btn-ghost mt-2 w-full" onClick={cancel}>Hủy đặt vé</button>
      </div>
    </div>
  );
}
