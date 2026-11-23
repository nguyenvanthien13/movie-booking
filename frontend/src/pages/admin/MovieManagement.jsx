import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { movieService } from "../../services/movieService";
import { errorMessage } from "../../services/api";
import Loading, { ErrorBox } from "../../components/Loading";
import { MOVIE_STATUS } from "../../utils/format";

const EMPTY = { title: "", description: "", duration: 100, genre: "", posterUrl: "", trailerUrl: "", releaseDate: "", status: "UPCOMING" };

export default function MovieManagement() {
  const [movies, setMovies] = useState(null);
  const [form, setForm] = useState(null); // null = đóng form
  const [error, setError] = useState("");

  const load = useCallback(() => movieService.list({ size: 50 }).then((r) => setMovies(r.content)).catch((e) => setError(errorMessage(e))), []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setError("");
    const payload = { ...form, duration: Number(form.duration), releaseDate: form.releaseDate || null };
    try {
      if (form.id) await movieService.update(form.id, payload); else await movieService.create(payload);
      setForm(null); await load();
    } catch (err) { setError(errorMessage(err)); }
  };

  const remove = async (m) => {
    if (!window.confirm(`Xóa phim "${m.title}"?`)) return;
    setError("");
    try { await movieService.remove(m.id); await load(); } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Quản lý phim</h1>
        <button className="btn-primary btn-sm" onClick={() => setForm(EMPTY)}><Plus className="h-4 w-4" /> Thêm phim</button>
      </div>
      <div className="mt-4"><ErrorBox message={error} /></div>

      {form && (
        <form onSubmit={save} className="card mt-4 grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">{form.id ? "Sửa phim" : "Thêm phim mới"}</h2>
          <div className="sm:col-span-2"><label className="label" htmlFor="title">Tên phim</label><input id="title" required className="input" value={form.title} onChange={set("title")} /></div>
          <div><label className="label" htmlFor="genre">Thể loại</label><input id="genre" className="input" value={form.genre || ""} onChange={set("genre")} /></div>
          <div><label className="label" htmlFor="duration">Thời lượng (phút)</label><input id="duration" type="number" min="1" required className="input" value={form.duration} onChange={set("duration")} /></div>
          <div><label className="label" htmlFor="releaseDate">Ngày phát hành</label><input id="releaseDate" type="date" className="input" value={form.releaseDate || ""} onChange={set("releaseDate")} /></div>
          <div><label className="label" htmlFor="status">Trạng thái</label>
            <select id="status" className="input" value={form.status} onChange={set("status")}>
              {Object.entries(MOVIE_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></div>
          <div><label className="label" htmlFor="poster">Link poster</label><input id="poster" className="input" value={form.posterUrl || ""} onChange={set("posterUrl")} /></div>
          <div><label className="label" htmlFor="trailer">Link trailer</label><input id="trailer" className="input" value={form.trailerUrl || ""} onChange={set("trailerUrl")} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="desc">Mô tả</label><textarea id="desc" rows={3} className="input" value={form.description || ""} onChange={set("description")} /></div>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary">Lưu phim</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Hủy</button>
          </div>
        </form>
      )}

      <div className="card mt-4 overflow-x-auto">
        {!movies ? <Loading /> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3">Phim</th><th>Thể loại</th><th>Thời lượng</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-semibold">{m.title}</td><td>{m.genre}</td><td>{m.duration} phút</td><td>{MOVIE_STATUS[m.status]}</td>
                  <td className="space-x-1 p-3 text-right">
                    <button className="btn-ghost btn-sm" aria-label={`Sửa ${m.title}`} onClick={() => setForm({ ...m })}><Pencil className="h-3.5 w-3.5" /></button>
                    <button className="btn-ghost btn-sm" aria-label={`Xóa ${m.title}`} onClick={() => remove(m)}><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
