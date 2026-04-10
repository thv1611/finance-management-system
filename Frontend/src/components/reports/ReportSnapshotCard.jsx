export default function ReportSnapshotCard({ snapshot = null }) {
  const items = snapshot
    ? [
        ["Best Month", snapshot.bestMonth],
        ["Worst Month", snapshot.worstMonth],
        ["Biggest Category", snapshot.biggestCategory],
      ]
    : [];

  return (
    <section className="rounded-lg bg-gradient-to-br from-[#0b8f83] via-[#18a77d] to-[#77d8b5] p-5 text-white shadow-[0_28px_58px_rgba(22,128,103,0.26)] transition hover:-translate-y-1">
      <h2 className="text-lg font-black tracking-[-0.02em]">Report Snapshot</h2>
      {items.length > 0 ? (
        <div className="mt-5 space-y-4">
          {items.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white/14 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">{label}</p>
            <p className="mt-1 text-xl font-black">{value}</p>
          </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold leading-6 text-white/80">
          No data available. Reports will summarize your activity after transactions are added.
        </p>
      )}
    </section>
  );
}
