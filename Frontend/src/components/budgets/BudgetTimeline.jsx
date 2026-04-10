export default function BudgetTimeline({ milestones = [] }) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-lg bg-white/88 px-6 py-5 shadow-[0_20px_45px_rgba(35,66,85,0.055)]">
      <div className="relative grid gap-5 md:grid-cols-4">
        <div className="absolute left-8 right-8 top-5 hidden h-px bg-[#dfe7eb] md:block" />
        {milestones.map((milestone) => (
          <div key={milestone.id || `${milestone.date}-${milestone.label}`} className="relative flex items-start gap-3 md:block md:text-center">
            <span className="relative z-10 mt-1 inline-block h-3 w-3 rounded-full bg-[#13977f] ring-4 ring-[#e5f7f2] md:mx-auto md:mb-3 md:mt-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8b98a5]">{milestone.date}</p>
              <p className="mt-1 text-sm font-black text-[#34424d]">{milestone.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
