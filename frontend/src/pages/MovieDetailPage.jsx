import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, Calendar, Play } from "lucide-react";
import { movieService } from "../services/movieService";
import { errorMessage } from "../services/api";
import { Poster } from "../components/MovieCard";
import Loading, { ErrorBox } from "../components/Loading";
import { MOVIE_STATUS } from "../utils/format";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMovie(null);
    movieService.get(id).then(setMovie).catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!movie) return <Loading />;

  return (
    <article className="grid gap-8 md:grid-cols-[280px_1fr]">
      <Poster movie={movie} className="aspect-[2/3] w-full max-w-[280px] rounded-xl" />
      <div>
        <span className="badge bg-ink text-white">{MOVIE_STATUS[movie.status]}</span>
        <h1 className="mt-2 text-4xl font-extrabold">{movie.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-muted">
          {movie.genre && <span>{movie.genre}</span>}
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {movie.duration} phút</span>
          {movie.releaseDate && (
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Khởi chiếu {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</span>
          )}
        </p>
        <p className="mt-5 max-w-prose">{movie.description || "Chưa có mô tả cho phim này."}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {movie.status === "NOW_SHOWING" ? (
            <Link to={`/movies/${movie.id}/showtimes`} className="btn-primary">Chọn suất chiếu</Link>
          ) : (
            <span className="btn-ghost cursor-default">Chưa mở bán vé</span>
          )}
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="btn-ghost"><Play className="h-4 w-4" /> Xem trailer</a>
          )}
        </div>
      </div>
    </article>
  );
}
