export default function CashFlowSummaryCard({ title, value, badge, tone = "positive" }) {
  const positive = tone === "positive";

  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(35,66,85,0.1)]">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#9aa6b2]">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-black tracking-[-0.04em] text-[#1f2d38]">{value}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${positive ? "bg-[#e7f7f0] text-[#129477]" : "bg-[#fff0f1] text-[#dd4d58]"}`}>
          {badge}
        </span>
      </div>
    </article>
  );
}
