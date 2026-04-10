import { Icon } from "./DashboardIcons";

export default function StatCard({ icon, label, amount, trend, tone = "positive" }) {
  const isPositive = tone === "positive";

  return (
    <article className="group rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(35,66,85,0.1)]">
      <div className="mb-5 flex items-start justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef7fb] text-[#2c8dec]">
          <Icon name={icon} className="h-4 w-4" />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            isPositive ? "bg-[#e8f8f1] text-[#10966f]" : "bg-[#fff1f1] text-[#e05b62]"
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ba8b4]">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#1f2d38]">{amount}</p>
    </article>
  );
}
