import { Link, NavLink, useNavigate } from "react-router-dom";
import { Ticket, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const link = ({ isActive }) =>
  `px-1 py-1 text-sm font-medium border-b-2 ${isActive ? "border-velvet text-ink" : "border-transparent text-muted hover:text-ink"}`;

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <Ticket className="h-6 w-6 text-velvet" /> Vé Phim
        </Link>
        <nav className="flex flex-1 items-center gap-5">
          <NavLink to="/movies" end className={link}>Phim</NavLink>
          {user && <NavLink to="/my-bookings" className={link}>Vé của tôi</NavLink>}
          {isAdmin && <NavLink to="/admin" className={link}>Quản trị</NavLink>}
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">{user.fullName}</span>
            <button className="btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost btn-sm">Đăng nhập</Link>
            <Link to="/register" className="btn-primary btn-sm">Đăng ký</Link>
          </div>
        )}
      </div>
    </header>
  );
}
