import BudgetCard from "../components/budgets/BudgetCard";
import BudgetDecorPanel from "../components/budgets/BudgetDecorPanel";
import BudgetTimeline from "../components/budgets/BudgetTimeline";
import CategoryLimitsCard from "../components/budgets/CategoryLimitsCard";
import RecentAlertsCard from "../components/budgets/RecentAlertsCard";
import SmartInsightCard from "../components/budgets/SmartInsightCard";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency, getBudgetSummary, useFinanceData } from "../lib/financeData";

export default function BudgetsPage() {
  const { user } = getAuthSession();
  const { isLoading, budgets } = useFinanceData();
  const budgetSummary = getBudgetSummary(budgets);
  const summaryCards = [
    ["Total Budget", formatCurrency(budgetSummary.totalBudget)],
    ["Total Spent", formatCurrency(budgetSummary.totalSpent)],
    ["Remaining", formatCurrency(budgetSummary.remaining)],
    ["Overspent", String(budgetSummary.overspent), "Categories", "warning"],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Budgets" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:py-8">
          <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Budgets</h1>
              <p className="mt-2 text-base font-semibold text-[#7a8794]">
                Plan spending limits and maintain your financial sanctuary.
              </p>
            </div>
            <button className="w-fit rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]">
              + Create Budget
            </button>
          </header>

          {isLoading ? (
            <LoadingState />
          ) : budgets.length > 0 ? (
            <BudgetTimeline milestones={budgets.flatMap((budget) => budget.milestones || [])} />
          ) : (
            <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
              <EmptyState
                title="No budgets yet"
                message="Create your first budget to plan spending limits and monitor progress."
                actionLabel="+ Create Budget"
              />
            </section>
          )}

          {!isLoading && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(([title, value, subtitle, tone]) => (
                  <BudgetCard key={title} title={title} value={value} subtitle={subtitle} tone={tone} />
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.9fr)]">
                <CategoryLimitsCard budgets={budgets} />
                <div className="space-y-6">
                  <SmartInsightCard hasData={budgets.length > 0} />
                  <RecentAlertsCard alerts={[]} />
                  <BudgetDecorPanel remaining={budgetSummary.remaining} />
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
