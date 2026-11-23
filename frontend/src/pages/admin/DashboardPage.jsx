import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { errorMessage } from "../../services/api";
import Loading, { ErrorBox } from "../../components/Loading";
import { formatMoney } from "../../utils/format";

function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => Number(d.revenue)), 1);
  return (
    <div className="flex h-48 items-end gap-1.5" role="img" aria-label="Biểu đồ doanh thu theo ngày">
      {data.map((d) => {
        const h = (Number(d.revenue) / max) * 100;
        const day = new Date(d.date);
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${day.toLocaleDateString("vi-VN")}: ${formatMoney(d.revenue)}`}>
            <div className="w-full rounded-t bg-velvet" style={{ height: `${Math.max(h, d.revenue > 0 ? 3 : 0.5)}%` }} />
            <span className="text-[10px] text-muted">{day.getDate()}/{day.getMonth() + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { adminService.stats(14).then(setStats).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <ErrorBox message={error} />;
  if (!stats) return <Loading />;

  const cards = [
    ["Tổng số phim", stats.totalMovies],
    ["Vé đã bán", stats.totalTicketsSold],
    ["Tổng doanh thu", formatMoney(stats.totalRevenue)],
    ["Người dùng", stats.totalUsers],
  ];

  return (
    <>
      <h1 className="text-2xl font-extrabold">Tổng quan</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-5">
        <h2 className="mb-4 text-lg font-bold">Doanh thu 14 ngày gần nhất</h2>
        <RevenueChart data={stats.revenueByDay} />
      </div>
    </>
  );
}
