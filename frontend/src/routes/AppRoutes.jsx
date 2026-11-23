import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import HomePage from "../pages/HomePage";
import MovieListPage from "../pages/MovieListPage";
import MovieDetailPage from "../pages/MovieDetailPage";
import ShowtimePage from "../pages/ShowtimePage";
import BookingPage from "../pages/BookingPage";
import PaymentPage from "../pages/PaymentPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import MovieManagement from "../pages/admin/MovieManagement";
import CinemaManagement from "../pages/admin/CinemaManagement";
import ShowtimeManagement from "../pages/admin/ShowtimeManagement";
import BookingManagement from "../pages/admin/BookingManagement";

function Protected({ children, admin = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MovieListPage />} />
        <Route path="movies/:id" element={<MovieDetailPage />} />
        <Route path="movies/:id/showtimes" element={<ShowtimePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="booking/:showtimeId" element={<Protected><BookingPage /></Protected>} />
        <Route path="payment/:bookingId" element={<Protected><PaymentPage /></Protected>} />
        <Route path="my-bookings" element={<Protected><MyBookingsPage /></Protected>} />
      </Route>
      <Route path="admin" element={<Protected admin><AdminLayout /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="movies" element={<MovieManagement />} />
        <Route path="cinemas" element={<CinemaManagement />} />
        <Route path="showtimes" element={<ShowtimeManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
