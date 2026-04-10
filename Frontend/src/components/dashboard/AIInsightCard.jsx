import { Icon } from "./DashboardIcons";

export default function AIInsightCard({ hasData = false }) {
  return (
    <section className="rounded-lg bg-gradient-to-br from-[#0a8d86] via-[#1b7c98] to-[#2e5f8f] p-5 text-white shadow-[0_28px_58px_rgba(22,111,128,0.28)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="ai" className="h-5 w-5" />
        <h2 className="text-lg font-black tracking-[-0.02em]">AI Insight</h2>
      </div>
      <p className="text-sm font-medium leading-6 text-white/88">
        {hasData
          ? "Your latest activity is ready for analysis."
          : "Add transactions and budgets to unlock personalized financial recommendations."}
      </p>
      {hasData && (
        <button className="mt-5 rounded-lg bg-white/18 px-4 py-2.5 text-sm font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition hover:bg-white/25">
          Set Adjustment Goal
        </button>
      )}
    </section>
  );
}
