import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { MOVIE_STATUS } from "../utils/format";

export const Poster = ({ movie, className = "" }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400 ${className}`}>
    <span className="absolute inset-0 flex items-end p-3 font-display text-lg font-bold text-slate-600">{movie.title}</span>
    {movie.posterUrl && (
      <img src={movie.posterUrl} alt={`Poster ${movie.title}`} loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
    )}
  </div>
);

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <Poster movie={movie} className="aspect-[2/3] rounded-xl" />
      <div className="mt-2">
        <h3 className="text-base font-bold group-hover:text-velvet">{movie.title}</h3>
        <p className="flex items-center gap-2 text-sm text-muted">
          <span>{movie.genre}</span>
          {movie.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{movie.duration} phút</span>}
        </p>
        {movie.status === "UPCOMING" && <span className="badge mt-1 bg-slate-200 text-slate-700">{MOVIE_STATUS.UPCOMING}</span>}
      </div>
    </Link>
  );
}
