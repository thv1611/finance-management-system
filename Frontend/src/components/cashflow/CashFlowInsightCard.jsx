import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";

export default function CashFlowInsightCard({
  title = "AI Smart Insight",
  description,
  recommendation,
  actionLabel,
  actionTo,
}) {
  return (
    <section className="rounded-lg bg-gradient-to-br from-[#eef8f5] via-[#f7fbfa] to-[#dfeeee] p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)] transition hover:-translate-y-1">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-[#13977f] text-white shadow-[0_14px_28px_rgba(19,151,127,0.22)]">
        <Icon name="ai" className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-black tracking-[-0.02em] text-[#137566]">{title}</h2>
      <p className="mt-4 text-sm font-semibold leading-6 text-[#4e5c67]">{description}</p>
      {recommendation ? (
        <div className="mt-5 rounded-lg bg-white/75 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8b98a5]">Recommendation</p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[#63717c]">{recommendation}</p>
        </div>
      ) : null}
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 block w-full rounded-lg bg-[#087d6f] px-5 py-3 text-center text-sm font-black text-white shadow-[0_14px_30px_rgba(8,125,111,0.22)] transition hover:-translate-y-0.5 hover:bg-[#06685d]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
