import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import LoadingState from "../components/common/LoadingState";
import AIAnalysisSection from "../components/reports/AIAnalysisSection";
import IncomeExpenseCard from "../components/reports/IncomeExpenseCard";
import MonthlyComparisonCard from "../components/reports/MonthlyComparisonCard";
import ReportSnapshotCard from "../components/reports/ReportSnapshotCard";
import ReportsFilters from "../components/reports/ReportsFilters";
import ReportsHeader from "../components/reports/ReportsHeader";
import SavingRatioCard from "../components/reports/SavingRatioCard";
import SpendingCategoryCard from "../components/reports/SpendingCategoryCard";
import TopSpendingCard from "../components/reports/TopSpendingCard";
import { getAuthSession } from "../lib/authSession";
import { useFinanceData } from "../lib/financeData";

export default function ReportsPage() {
  const { user } = getAuthSession();
  const { isLoading, reports, transactions, budgets } = useFinanceData();
  const hasReportData = transactions.length > 0 || budgets.length > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Reports" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-8 lg:py-8">
          <ReportsHeader user={user} />
          <ReportsFilters />

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(420px,1.55fr)_minmax(260px,0.75fr)]">
            <div className="space-y-6">
              <SpendingCategoryCard data={reports.categorySpending} />
              <SavingRatioCard ratio={reports.savingRatio} />
              <ReportSnapshotCard snapshot={reports.snapshot} />
            </div>

            <div className="space-y-6">
              <MonthlyComparisonCard data={reports.monthlyComparison} />
              <IncomeExpenseCard data={reports.incomeExpense} />
            </div>

            <div className="space-y-6">
              <TopSpendingCard items={reports.topSpending} />
            </div>
          </section>

          <AIAnalysisSection hasData={hasReportData} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
