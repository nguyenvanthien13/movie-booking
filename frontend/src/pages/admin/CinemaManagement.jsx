import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { showtimeService } from "../../services/showtimeService";
import { errorMessage } from "../../services/api";
import Loading, { ErrorBox } from "../../components/Loading";

export default function CinemaManagement() {
  const [cinemas, setCinemas] = useState(null);
  const [rooms, setRooms] = useState({});
  const [cinemaForm, setCinemaForm] = useState({ name: "", address: "", city: "" });
  const [roomForm, setRoomForm] = useState({ name: "", roomType: "2D", rows: 6, columns: 8 });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await showtimeService.cinemas();
      const entries = await Promise.all(list.map(async (c) => [c.id, await showtimeService.rooms(c.id)]));
      setCinemas(list); setRooms(Object.fromEntries(entries));
    } catch (e) { setError(errorMessage(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn) => { setError(""); try { await fn(); await load(); } catch (e) { setError(errorMessage(e)); } };

  return (
    <>
      <h1 className="text-2xl font-extrabold">Rạp và phòng chiếu</h1>
      <div className="mt-4"><ErrorBox message={error} /></div>

      <form className="card mt-4 grid gap-3 p-5 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); run(async () => { await adminService.createCinema(cinemaForm); setCinemaForm({ name: "", address: "", city: "" }); }); }}>
        <div><label className="label" htmlFor="cn">Tên rạp</label><input id="cn" required className="input" value={cinemaForm.name} onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="ca">Địa chỉ</label><input id="ca" className="input" value={cinemaForm.address} onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })} /></div>
        <div><label className="label" htmlFor="cc">Thành phố</label><input id="cc" className="input" value={cinemaForm.city} onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })} /></div>
        <div className="flex items-end"><button className="btn-primary w-full">Thêm rạp</button></div>
      </form>

      <div className="mt-4 space-y-4">
        {!cinemas ? <Loading /> : cinemas.map((c) => (
          <section key={c.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-bold">{c.name}</h2><p className="text-sm text-muted">{c.address}{c.city ? `, ${c.city}` : ""}</p></div>
              <button className="btn-ghost btn-sm" aria-label={`Xóa rạp ${c.name}`} onClick={() => window.confirm(`Xóa rạp "${c.name}" và các phòng của rạp?`) && run(() => adminService.removeCinema(c.id))}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(rooms[c.id] || []).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <span><strong>{r.name}</strong> · {r.roomType} · {r.capacity} ghế</span>
                  <button className="btn-ghost btn-sm" aria-label={`Xóa ${r.name}`} onClick={() => window.confirm(`Xóa ${r.name}?`) && run(() => adminService.removeRoom(r.id))}><Trash2 className="h-3.5 w-3.5" /></button>
                </li>
              ))}
              {(rooms[c.id] || []).length === 0 && <li className="py-2 text-muted">Chưa có phòng chiếu.</li>}
            </ul>
            <form className="mt-3 grid gap-2 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); run(() => adminService.createRoom({ ...roomForm, rows: Number(roomForm.rows), columns: Number(roomForm.columns), cinemaId: c.id })); }}>
              <input aria-label="Tên phòng" required placeholder="Tên phòng" className="input" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
              <select aria-label="Loại phòng" className="input" value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}><option>2D</option><option>3D</option><option>IMAX</option></select>
              <input aria-label="Số hàng ghế" type="number" min="1" max="26" className="input" value={roomForm.rows} onChange={(e) => setRoomForm({ ...roomForm, rows: e.target.value })} />
              <input aria-label="Số ghế mỗi hàng" type="number" min="1" max="30" className="input" value={roomForm.columns} onChange={(e) => setRoomForm({ ...roomForm, columns: e.target.value })} />
              <button className="btn-dark">Thêm phòng</button>
            </form>
          </section>
        ))}
      </div>
    </>
  );
}
