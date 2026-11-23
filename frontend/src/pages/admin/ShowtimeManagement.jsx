import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { movieService } from "../../services/movieService";
import { showtimeService } from "../../services/showtimeService";
import { errorMessage } from "../../services/api";
import Loading, { ErrorBox } from "../../components/Loading";
import { formatDateTime, formatMoney } from "../../utils/format";

export default function ShowtimeManagement() {
  const [list, setList] = useState(null);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]); // [{id, label}]
  const [form, setForm] = useState({ movieId: "", roomId: "", startTime: "", price: 85000 });
  const [error, setError] = useState("");

  const load = useCallback(() => adminService.showtimes().then(setList).catch((e) => setError(errorMessage(e))), []);

  useEffect(() => {
    load();
    movieService.list({ size: 50 }).then((r) => setMovies(r.content));
    showtimeService.cinemas().then(async (cs) => {
      const all = await Promise.all(cs.map(async (c) => (await showtimeService.rooms(c.id)).map((r) => ({ id: r.id, label: `${c.name} — ${r.name} (${r.roomType})` }))));
      setRooms(all.flat());
    });
  }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      await adminService.createShowtime({ movieId: Number(form.movieId), roomId: Number(form.roomId), startTime: form.startTime, price: Number(form.price) });
      await load();
    } catch (err) { setError(errorMessage(err)); }
  };

  const remove = async (s) => {
    if (!window.confirm("Xóa suất chiếu này?")) return;
    setError("");
    try { await adminService.removeShowtime(s.id); await load(); } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold">Suất chiếu và giá vé</h1>
      <div className="mt-4"><ErrorBox message={error} /></div>
      <form onSubmit={submit} className="card mt-4 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div><label className="label" htmlFor="m">Phim</label>
          <select id="m" required className="input" value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
            <option value="">Chọn phim</option>{movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select></div>
        <div><label className="label" htmlFor="r">Phòng chiếu</label>
          <select id="r" required className="input" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
            <option value="">Chọn phòng</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select></div>
        <div><label className="label" htmlFor="t">Giờ bắt đầu</label><input id="t" type="datetime-local" required className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
        <div><label className="label" htmlFor="p">Giá vé cơ bản (VND)</label><input id="p" type="number" min="1000" step="1000" required className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div className="flex items-end"><button className="btn-primary w-full">Tạo suất chiếu</button></div>
      </form>

      <div className="card mt-4 overflow-x-auto">
        {!list ? <Loading /> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3">Phim</th><th>Rạp / phòng</th><th>Giờ chiếu</th><th>Giá</th><th>Ghế trống</th><th /></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-semibold">{s.movieTitle}</td><td>{s.cinemaName} · {s.roomName}</td>
                  <td>{formatDateTime(s.startTime)}</td><td>{formatMoney(s.price)}</td><td>{s.availableSeats}</td>
                  <td className="p-3 text-right"><button className="btn-ghost btn-sm" aria-label="Xóa suất chiếu" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
