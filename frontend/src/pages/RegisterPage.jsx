import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../services/api";
import { ErrorBox } from "../components/Loading";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await register(form); navigate("/", { replace: true }); }
    catch (err) {
      const details = err.response?.data?.data;
      setError(details ? Object.values(details).join(" · ") : errorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-extrabold">Tạo tài khoản</h1>
      <form onSubmit={submit} className="card mt-5 space-y-4 p-5">
        <ErrorBox message={error} />
        <div><label className="label" htmlFor="fullName">Họ tên</label><input id="fullName" required className="input" value={form.fullName} onChange={set("fullName")} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" value={form.email} onChange={set("email")} /></div>
        <div><label className="label" htmlFor="phone">Số điện thoại</label><input id="phone" type="tel" className="input" value={form.phone} onChange={set("phone")} /></div>
        <div><label className="label" htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</label><input id="password" type="password" minLength={6} required className="input" value={form.password} onChange={set("password")} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Đang tạo tài khoản..." : "Đăng ký"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">Đã có tài khoản? <Link to="/login" className="font-semibold text-velvet">Đăng nhập</Link></p>
    </div>
  );
}
