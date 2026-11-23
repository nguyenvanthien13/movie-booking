import { Loader2 } from "lucide-react";

export default function Loading({ text = "Đang tải..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
      <Loader2 className="h-5 w-5 animate-spin" /> <span>{text}</span>
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>;
}

export function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-line bg-white/60 py-12 text-center text-muted">{children}</p>;
}
