export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Vé Phim — dự án học tập Full-stack (React · Spring Boot · PostgreSQL)</span>
        <span>Thanh toán trong ứng dụng là mô phỏng, không phát sinh giao dịch thật.</span>
      </div>
    </footer>
  );
}
