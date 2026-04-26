import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";

export default function AIInsightCard({
  title = "AI Insight",
  description,
  actionLabel,
  actionTo,
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a8d86] via-[#1b7c98] to-[#2e5f8f] p-5 text-white shadow-[0_28px_58px_rgba(22,111,128,0.28)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-36px] right-10 h-24 w-24 rounded-full bg-[#a9f2e3]/20 blur-2xl" />
      <div className="relative z-10 mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
          <Icon name="ai" className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/70">Assistant Signal</p>
          <h2 className="text-lg font-black tracking-[-0.02em]">{title}</h2>
        </div>
      </div>
      <p className="relative z-10 text-sm font-medium leading-6 text-white/88">{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="relative z-10 mt-5 inline-flex rounded-2xl bg-white/18 px-4 py-2.5 text-sm font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition hover:bg-white/25"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
