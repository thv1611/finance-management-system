import CashFlowChartCard from "../components/cashflow/CashFlowChartCard";
import CashFlowFilters from "../components/cashflow/CashFlowFilters";
import CashFlowHeader from "../components/cashflow/CashFlowHeader";
import CashFlowInsightCard from "../components/cashflow/CashFlowInsightCard";
import CashFlowSummaryCard from "../components/cashflow/CashFlowSummaryCard";
import CategoryTrendsCard from "../components/cashflow/CategoryTrendsCard";
import ExportTrendReportCard from "../components/cashflow/ExportTrendReportCard";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency, getTransactionSummary, useFinanceData } from "../lib/financeData";

export default function CashFlowTrendsPage() {
  const { user } = getAuthSession();
  const { isLoading, transactions, reports } = useFinanceData();
  const summary = getTransactionSummary(transactions);
  const hasData = transactions.length > 0;
  const summaries = [
    ["Total Income", formatCurrency(summary.income), hasData ? "Live" : "0%", "positive"],
    ["Total Expenses", formatCurrency(summary.expenses), hasData ? "Live" : "0%", hasData ? "negative" : "positive"],
    ["Net Difference", `${summary.net >= 0 ? "+" : "-"}${formatCurrency(summary.net)}`, hasData ? "Live" : "0%", "positive"],
    ["Avg Daily Flow", formatCurrency(hasData ? summary.net / 30 : 0), hasData ? "Live" : "0%", "positive"],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Reports" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:py-8">
          <CashFlowHeader />
          <CashFlowFilters />
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
          <CashFlowChartCard data={reports.cashFlow} />

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaries.map(([title, value, badge, tone]) => (
              <CashFlowSummaryCard key={title} title={title} value={value} badge={badge} tone={tone} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <CategoryTrendsCard categories={reports.categoryTrends} />
            <div className="space-y-6">
              <CashFlowInsightCard hasData={hasData} />
              <ExportTrendReportCard />
            </div>
          </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
