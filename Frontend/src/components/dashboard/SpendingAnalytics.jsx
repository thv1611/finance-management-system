const tabs = ["Monthly", "Weekly", "Yearly"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export default function SpendingAnalytics({ data = [] }) {
  const hasData = data.length > 0;

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Spending Analytics</h2>
        <div className="flex rounded-lg bg-[#f1f5f7] p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                tab === "Monthly"
                  ? "bg-white text-[#13907f] shadow-[0_6px_14px_rgba(30,62,82,0.08)]"
                  : "text-[#8a97a4] hover:text-[#26333e]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[300px] overflow-hidden rounded-lg bg-gradient-to-b from-white to-[#fbfdfe]">
        {hasData ? (
          <svg className="h-full w-full" viewBox="0 0 680 300" preserveAspectRatio="none" aria-label="Monthly spending line chart">
            {[60, 120, 180, 240].map((y) => (
              <line key={y} x1="20" x2="660" y1={y} y2={y} stroke="#edf2f5" strokeWidth="1" />
            ))}
          </svg>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 h-12 w-12 rounded-lg bg-[#e7f7f0]" />
            <p className="text-lg font-black text-[#25313b]">No spending data yet</p>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#7a8794]">
              Add transactions to unlock analytics and trends.
            </p>
          </div>
        )}
        {hasData && (
          <div className="absolute bottom-4 left-0 right-0 grid grid-cols-8 px-7 text-center text-xs font-semibold text-[#9aa6b2]">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
