import { QRCodeSVG } from "qrcode.react";
import { formatDateTime, formatMoney } from "../utils/format";

/** Vé điện tử: nửa trên là thông tin phim, nửa dưới (sau đường đục lỗ) là mã QR. */
export default function Ticket({ ticket }) {
  return (
    <div className="ticket mx-auto w-full max-w-sm" style={{ "--cut": "62%" }}>
      <div className="p-5 pb-6" style={{ minHeight: "62%" }}>
        <p className="text-xs text-muted">{ticket.cinemaName} · {ticket.roomName}</p>
        <h3 className="mt-1 text-2xl font-extrabold">{ticket.movieTitle}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt className="text-muted">Suất chiếu</dt><dd className="font-semibold">{formatDateTime(ticket.startTime)}</dd></div>
          <div><dt className="text-muted">Ghế</dt><dd className="font-semibold">{ticket.seats.join(", ")}</dd></div>
          <div><dt className="text-muted">Khách hàng</dt><dd className="font-semibold">{ticket.customerName}</dd></div>
          <div><dt className="text-muted">Tổng tiền</dt><dd className="font-semibold">{formatMoney(ticket.totalAmount)}</dd></div>
        </dl>
      </div>
      <div className="ticket-perf flex flex-col items-center gap-2 p-5">
        <QRCodeSVG value={ticket.qrPayload} size={132} />
        <p className="font-mono text-sm font-semibold tracking-widest">{ticket.bookingCode}</p>
        <p className="text-xs text-muted">{ticket.cinemaAddress}</p>
      </div>
    </div>
  );
}
