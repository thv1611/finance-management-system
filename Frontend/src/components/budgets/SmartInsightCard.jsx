import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";

export default function SmartInsightCard({ hasData = false }) {
  return (
    <section className="rounded-lg bg-gradient-to-br from-white via-[#f9fcfb] to-[#eff8f5] p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)] transition hover:-translate-y-1 hover:shadow-[0_30px_62px_rgba(35,66,85,0.1)]">
      <div className="mb-4 flex items-center gap-2 text-[#13977f]">
        <Icon name="ai" className="h-5 w-5" />
        <p className="text-xs font-black uppercase tracking-[0.14em]">Smart Insight</p>
      </div>
      <h2 className="text-2xl font-black tracking-[-0.03em] text-[#25313b]">Optimize Your Flow</h2>
      <p className="mt-4 text-sm font-semibold leading-6 text-[#6f7c88]">
        {hasData
          ? "Budget insights update automatically when you add limits and transactions."
          : "Create budgets and add transactions to unlock smart recommendations."}
      </p>
      {hasData && (
        <Link
          to="/ai-insights"
          className="mt-6 inline-flex rounded-lg bg-[#26333e] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(38,51,62,0.18)] transition hover:-translate-y-0.5 hover:bg-[#13977f]"
        >
          Apply Suggestion
        </Link>
      )}
    </section>
  );
}
