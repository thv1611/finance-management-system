import { Icon } from "../dashboard/DashboardIcons";

export default function AIAnalysisSection({ hasData = false }) {
  return (
    <section className="relative mt-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)]">
      <div className="relative z-10 max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#e7f7f0] text-[#13977f]">
            <Icon name="ai" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-[-0.02em] text-[#25313b]">AI Analysis</h2>
            <p className="text-sm font-bold text-[#8b98a5]">Spending Trends</p>
          </div>
        </div>

        <p className="text-sm font-semibold leading-6 text-[#687684]">
          {hasData
            ? "Your financial trends are ready for analysis."
            : "No data available. AI analysis appears after transactions and budgets are available."}
        </p>
      </div>

      <div className="pointer-events-none absolute right-[-36px] top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full bg-[#e5f7f2] md:block" />
      <div className="pointer-events-none absolute right-12 top-1/2 hidden h-20 w-20 -translate-y-1/2 rotate-12 rounded-lg bg-[#d8edff] md:block" />
    </section>
  );
}
