import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";

export function WeeklyAIInsightsCard({ hasData = false }) {
  return (
    <section className="rounded-lg bg-gradient-to-br from-[#0b8f83] via-[#1b8ea0] to-[#355f9e] p-5 text-white shadow-[0_28px_58px_rgba(22,111,128,0.26)]">
      <div className="mb-5 flex items-center gap-2">
        <Icon name="ai" className="h-5 w-5" />
        <h2 className="text-lg font-black tracking-[-0.02em]">Weekly AI Insights</h2>
      </div>
      {hasData ? (
        <button className="mt-5 w-full rounded-lg bg-white/18 px-4 py-2.5 text-sm font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition hover:bg-white/25">
          View Full Report
        </button>
      ) : (
        <p className="text-sm font-semibold leading-6 text-white/80">
          Add transactions to unlock weekly AI insights.
        </p>
      )}
    </section>
  );
}

export function SavingGoalsCard({ hasData = false }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Saving Goals</h2>
      {hasData ? (
        <>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#687684]">
            Savings progress updates as soon as goals are connected.
          </p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#edf2f5]">
            <div className="h-full w-0 rounded-full bg-[#13977f]" />
          </div>
        </>
      ) : (
        <EmptyState className="mt-4 min-h-[130px]" title="No savings goal" message="Create a goal to track progress." />
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
          ["receipt", "Request Receipt"],
          ["send", "Move Funds"],
        ].map(([icon, label]) => (
          <button
            key={label}
            className="flex items-center gap-3 rounded-lg bg-[#f3f7f9] px-4 py-4 text-sm font-black text-[#4d5b66] transition hover:-translate-y-0.5 hover:bg-[#e8f4f1] hover:text-[#0f8e7e]"
          >
            <Icon name={icon} className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
