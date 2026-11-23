import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { movieService } from "../services/movieService";
import { showtimeService } from "../services/showtimeService";
import { errorMessage } from "../services/api";
import Loading, { ErrorBox, Empty } from "../components/Loading";
import { formatMoney, formatTime, toDateKey } from "../utils/format";

export default function ShowtimePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState("");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [showtimes, setShowtimes] = useState(null);
  const [error, setError] = useState("");

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);

  useEffect(() => {
    Promise.all([movieService.get(id), showtimeService.cinemas()])
      .then(([m, c]) => { setMovie(m); setCinemas(c); })
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  useEffect(() => {
    setShowtimes(null);
    showtimeService.search({ movieId: id, cinemaId: cinemaId || undefined, date })
      .then(setShowtimes).catch((e) => setError(errorMessage(e)));
  }, [id, cinemaId, date]);

  // Nhóm theo rạp
  const grouped = useMemo(() => {
    const map = new Map();
    (showtimes || []).forEach((s) => map.set(s.cinemaName, [...(map.get(s.cinemaName) || []), s]));
    return [...map.entries()];
  }, [showtimes]);

  if (error) return <ErrorBox message={error} />;
  if (!movie) return <Loading />;

  return (
    <>
      <Link to={`/movies/${id}`} className="text-sm text-muted hover:text-ink">← {movie.title}</Link>
      <h1 className="mt-1 text-3xl font-extrabold">Lịch chiếu {movie.title}</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn ngày">
        {days.map((d) => {
          const key = toDateKey(d);
          return (
            <button key={key} role="tab" aria-selected={date === key} onClick={() => setDate(key)}
              className={`min-w-16 rounded-lg border px-3 py-2 text-center ${date === key ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>
              <div className="text-xs">{d.toLocaleDateString("vi-VN", { weekday: "short" })}</div>
              <div className="font-display text-lg font-bold">{d.getDate()}/{d.getMonth() + 1}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 max-w-xs">
        <label htmlFor="cinema" className="label">Rạp</label>
        <select id="cinema" className="input" value={cinemaId} onChange={(e) => setCinemaId(e.target.value)}>
          <option value="">Tất cả rạp</option>
          {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {!showtimes ? <Loading /> : grouped.length === 0 ? (
          <Empty>Không có suất chiếu nào trong ngày này. Hãy thử chọn ngày khác.</Empty>
        ) : grouped.map(([cinema, list]) => (
          <section key={cinema} className="card p-4">
            <h2 className="text-lg font-bold">{cinema}</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {list.map((s) => (
                <Link key={s.id} to={`/booking/${s.id}`}
                  className={`rounded-lg border border-line px-4 py-2 text-center hover:border-velvet ${s.availableSeats === 0 ? "pointer-events-none opacity-50" : ""}`}>
                  <div className="font-display text-xl font-bold">{formatTime(s.startTime)}</div>
                  <div className="text-xs text-muted">{s.roomName} · {s.roomType}</div>
                  <div className="text-xs text-muted">{s.availableSeats === 0 ? "Hết vé" : `${s.availableSeats} ghế · từ ${formatMoney(s.price)}`}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
