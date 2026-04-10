export default function BudgetCard({ title, value, subtitle, tone = "default" }) {
  const warning = tone === "warning";

  return (
    <article
      className={`rounded-lg p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(35,66,85,0.1)] ${
        warning
          ? "bg-[#fff0f1] ring-1 ring-[#f7d8dc]"
          : "bg-white"
      }`}
    >
      <p className={`text-xs font-black uppercase tracking-[0.08em] ${warning ? "text-[#de5964]" : "text-[#9aa6b2]"}`}>
        {title}
      </p>
      <p className={`mt-3 text-3xl font-black tracking-[-0.05em] ${warning ? "text-[#cf3f4c]" : "text-[#1f2d38]"}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`mt-1 text-xs font-black uppercase tracking-[0.08em] ${warning ? "text-[#e06a73]" : "text-[#9aa6b2]"}`}>
          {subtitle}
        </p>
      )}
    </article>
  );
}
