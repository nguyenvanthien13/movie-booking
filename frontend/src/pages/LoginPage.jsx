import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../services/api";
import { ErrorBox } from "../components/Loading";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await login(form.email, form.password); navigate(from, { replace: true }); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-extrabold">Đăng nhập</h1>
      <form onSubmit={submit} className="card mt-5 space-y-4 p-5">
        <ErrorBox message={error} />
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="password">Mật khẩu</label>
          <input id="password" type="password" required autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">Chưa có tài khoản? <Link to="/register" className="font-semibold text-velvet">Đăng ký</Link></p>
      <p className="mt-6 rounded-lg bg-white p-3 text-xs text-muted">
        Tài khoản demo — Khách: user@moviebooking.com / User@123 · Admin: admin@moviebooking.com / Admin@123
      </p>
    </div>
  );
}
