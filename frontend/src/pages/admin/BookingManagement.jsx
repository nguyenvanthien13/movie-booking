import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { errorMessage } from "../../services/api";
import Loading, { ErrorBox } from "../../components/Loading";
import { BOOKING_STATUS, formatDateTime, formatMoney } from "../../utils/format";

export default function BookingManagement() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { adminService.bookings().then(setList).catch((e) => setError(errorMessage(e))); }, []);

  return (
    <>
      <h1 className="text-2xl font-extrabold">Đơn đặt vé</h1>
      <div className="mt-4"><ErrorBox message={error} /></div>
      <div className="card mt-4 overflow-x-auto">
        {!list ? <Loading /> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3">Mã</th><th>Khách hàng</th><th>Phim / suất</th><th>Ghế</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} className="border-b border-line align-top last:border-0">
                  <td className="p-3 font-mono">{b.bookingCode}</td>
                  <td>{b.customerName}<div className="text-xs text-muted">{b.customerEmail}</div></td>
                  <td>{b.movieTitle}<div className="text-xs text-muted">{b.cinemaName} · {formatDateTime(b.startTime)}</div></td>
                  <td>{b.seats.join(", ")}</td><td>{formatMoney(b.totalAmount)}</td>
                  <td><span className={`badge ${BOOKING_STATUS[b.status].cls}`}>{BOOKING_STATUS[b.status].label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
