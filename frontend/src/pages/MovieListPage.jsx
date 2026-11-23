import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { movieService } from "../services/movieService";
import { errorMessage } from "../services/api";
import MovieCard from "../components/MovieCard";
import Loading, { ErrorBox, Empty } from "../components/Loading";

const TABS = [["", "Tất cả"], ["NOW_SHOWING", "Đang chiếu"], ["UPCOMING", "Sắp chiếu"]];

export default function MovieListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const status = params.get("status") || "";
  const page = Number(params.get("page") || 0);
  const [text, setText] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null); setError("");
    movieService.list({ q, status: status || undefined, page, size: 12 })
      .then(setData).catch((e) => setError(errorMessage(e)));
  }, [q, status, page]);

  const update = (patch) => {
    const next = Object.fromEntries(params);
    Object.entries(patch).forEach(([k, v]) => (v ? (next[k] = v) : delete next[k]));
    setParams(next);
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold">Danh sách phim</h1>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="tablist">
          {TABS.map(([v, label]) => (
            <button key={v} role="tab" aria-selected={status === v} onClick={() => update({ status: v, page: "" })}
              className={status === v ? "btn-dark btn-sm" : "btn-ghost btn-sm"}>{label}</button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); update({ q: text.trim(), page: "" }); }}>
          <label htmlFor="q" className="sr-only">Tên phim</label>
          <input id="q" className="input sm:w-64" placeholder="Tìm theo tên phim" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary">Tìm</button>
        </form>
      </div>

      <div className="mt-6">
        {error ? <ErrorBox message={error} /> : !data ? <Loading /> : data.content.length === 0 ? (
          <Empty>Không tìm thấy phim phù hợp. Thử từ khóa khác hoặc bỏ bộ lọc.</Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {data.content.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button className="btn-ghost btn-sm" disabled={page <= 0} onClick={() => update({ page: String(page - 1) })}>Trang trước</button>
                <span className="text-sm text-muted">Trang {page + 1} / {data.totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => update({ page: String(page + 1) })}>Trang sau</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
