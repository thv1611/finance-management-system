import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";

export function WeeklyAIInsightsCard({ hasData = false }) {
  return (
    <section className="rounded-lg bg-gradient-to-br from-[#0b8f83] via-[#1b8ea0] to-[#355f9e] p-5 text-white shadow-[0_28px_58px_rgba(22,111,128,0.26)]">
      <div className="mb-5 flex items-center gap-2">
        <Icon name="ai" className="h-5 w-5" />
        <h2 className="text-lg font-black tracking-[-0.02em]">Weekly AI Insights</h2>
      </div>
      {hasData ? (
        <Link
          to="/reports"
          className="mt-5 block w-full rounded-lg bg-white/18 px-4 py-2.5 text-center text-sm font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition hover:bg-white/25"
        >
          View Full Report
        </Link>
      ) : (
        <p className="text-sm font-semibold leading-6 text-white/80">
          Add transactions to unlock weekly AI insights.
        </p>
      )}
    </section>
  );
}

export function SavingGoalsCard({ hasData = false, summary = { income: 0, expenses: 0, net: 0 } }) {
  const income = Number(summary.income || 0);
  const net = Number(summary.net || 0);
  const positiveNet = Math.max(net, 0);
  const progress = income > 0 ? Math.min((positiveNet / income) * 100, 100) : 0;

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Savings Snapshot</h2>
      {hasData ? (
        <>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#687684]">
            {net >= 0
              ? `You kept ${Math.round(progress)}% of this month's income after expenses.`
              : "This month is currently negative. Reducing recent expenses will improve your savings buffer."}
          </p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#edf2f5]">
            <div
              className={`h-full rounded-full ${net >= 0 ? "bg-[#13977f]" : "bg-[#dd4d58]"}`}
              style={{ width: `${net >= 0 ? progress : 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.08em]">
            <span className="text-[#8d99a5]">Monthly net</span>
            <span className={net >= 0 ? "text-[#13977f]" : "text-[#dd4d58]"}>
              {net >= 0 ? "Positive" : "Negative"}
            </span>
          </div>
        </>
      ) : (
        <EmptyState className="mt-4 min-h-[130px]" title="No savings snapshot yet" message="Add income and expense transactions to see how much you are retaining this month." />
      )}
    </section>
  );
}

export function QuickShortcutsCard() {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Quick Shortcuts</h2>
      <div className="mt-5 grid gap-3">
        {[
          ["receipt", "Add Transaction", "/transactions/new"],
          ["report", "Open Reports", "/reports"],
        ].map(([icon, label, to]) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-lg bg-[#f3f7f9] px-4 py-4 text-sm font-black text-[#4d5b66] transition hover:-translate-y-0.5 hover:bg-[#e8f4f1] hover:text-[#0f8e7e]"
          >
            <Icon name={icon} className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
