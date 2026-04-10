import { Icon } from "../dashboard/DashboardIcons";

export default function TransactionSummaryCard({ icon, title, value, trend, tone = "positive" }) {
  const positive = tone === "positive";

  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(35,66,85,0.1)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef7fb] text-[#2d8ce9]">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        {trend && (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${positive ? "bg-[#e7f7f0] text-[#129477]" : "bg-[#fff0f1] text-[#dd4d58]"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#9aa6b2]">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#1f2d38]">{value}</p>
    </article>
  );
}
