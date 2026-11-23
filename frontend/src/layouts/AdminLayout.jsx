import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Film, CalendarClock, Ticket, Building2 } from "lucide-react";
import Header from "../components/Header";

const items = [
  { to: "/admin", label: "Tổng quan", icon: BarChart3, end: true },
  { to: "/admin/movies", label: "Phim", icon: Film },
  { to: "/admin/cinemas", label: "Rạp & phòng", icon: Building2 },
  { to: "/admin/showtimes", label: "Suất chiếu", icon: CalendarClock },
  { to: "/admin/bookings", label: "Đơn đặt vé", icon: Ticket },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
        <nav className="flex gap-1 overflow-x-auto md:w-48 md:flex-col" aria-label="Quản trị">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-ink text-white" : "text-muted hover:bg-white"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <section className="min-w-0 flex-1"><Outlet /></section>
      </div>
    </div>
  );
}
