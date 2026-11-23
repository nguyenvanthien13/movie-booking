import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { movieService } from "../services/movieService";
import { errorMessage } from "../services/api";
import MovieCard from "../components/MovieCard";
import Loading, { ErrorBox, Empty } from "../components/Loading";

function Row({ title, movies, to }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-velvet hover:underline">Xem tất cả</Link>
      </div>
      {movies.length === 0 ? <Empty>Chưa có phim.</Empty> : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.slice(0, 6).map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [now, setNow] = useState([]);
  const [soon, setSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([movieService.nowShowing(), movieService.upcoming()])
      .then(([a, b]) => { setNow(a); setSoon(b); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const submit = (e) => { e.preventDefault(); navigate(`/movies?q=${encodeURIComponent(q.trim())}`); };

  return (
    <>
      <section className="rounded-2xl bg-ink px-6 py-12 text-white sm:px-12">
        <h1 className="max-w-xl text-4xl font-extrabold sm:text-5xl">Chọn phim, chọn ghế, vào rạp.</h1>
        <p className="mt-3 max-w-lg text-slate-300">Xem lịch chiếu mới nhất, chọn đúng chỗ ngồi bạn thích và nhận vé điện tử ngay sau khi thanh toán.</p>
        <form onSubmit={submit} className="mt-6 flex max-w-lg gap-2" role="search">
          <label htmlFor="home-search" className="sr-only">Tìm phim</label>
          <input id="home-search" className="input !border-transparent text-ink" placeholder="Nhập tên phim..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn-primary shrink-0"><Search className="h-4 w-4" /> Tìm phim</button>
        </form>
      </section>

      {loading ? <Loading /> : error ? <div className="mt-8"><ErrorBox message={error} /></div> : (
        <>
          <Row title="Phim đang chiếu" movies={now} to="/movies?status=NOW_SHOWING" />
          <Row title="Phim sắp chiếu" movies={soon} to="/movies?status=UPCOMING" />
        </>
      )}
    </>
  );
}
