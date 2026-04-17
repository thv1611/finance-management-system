import { Link } from "react-router-dom";

export default function EmptyState({
  title = "No data available",
  message = "Add your first record to start seeing insights here.",
  actionLabel,
  onAction,
  actionHref,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d6e2e6] bg-[#f8fbfc] px-6 py-8 text-center ${className}`}
    >
      <div className="mb-4 h-12 w-12 rounded-lg bg-[#e7f7f0]" />
      <h3 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-[#7a8794]">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          to={actionHref}
          className="mt-5 rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]"
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && !actionHref ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
