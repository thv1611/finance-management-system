import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import LoadingState from "../components/common/LoadingState";
import TransactionSummaryCard from "../components/transactions/TransactionSummaryCard";
import TransactionsHeader from "../components/transactions/TransactionsHeader";
import TransactionsTable from "../components/transactions/TransactionsTable";
import TransactionsToolbar from "../components/transactions/TransactionsToolbar";
import {
  QuickShortcutsCard,
  SavingGoalsCard,
  WeeklyAIInsightsCard,
} from "../components/transactions/TransactionsWidgets";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency, getTransactionSummary, useFinanceData } from "../lib/financeData";

export default function TransactionsPage() {
  const { user } = getAuthSession();
  const { isLoading, transactions } = useFinanceData();
  const summary = getTransactionSummary(transactions);
  const hasTransactions = transactions.length > 0;
  const summaries = [
    ["dashboard", "Total Transactions", String(summary.count), hasTransactions ? "Live" : "0%", "positive"],
    ["income", "Monthly Income", formatCurrency(summary.income), hasTransactions ? "Live" : "0%", "positive"],
    ["expense", "Monthly Expenses", formatCurrency(summary.expenses), hasTransactions ? "Live" : "0%", hasTransactions ? "negative" : "positive"],
    ["wallet", "Net Balance", `${summary.net >= 0 ? "+" : "-"}${formatCurrency(summary.net)}`, hasTransactions ? "Live" : "0%", "positive"],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Transactions" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8">
          <TransactionsHeader user={user} />

          <section className="mt-8">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
              Transactions
            </h1>
            <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#7a8794]">
              Track and manage your recent financial activity with real-time insights and advanced filtering.
            </p>
          </section>

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaries.map(([icon, title, value, trend, tone]) => (
                  <TransactionSummaryCard key={title} icon={icon} title={title} value={value} trend={trend} tone={tone} />
                ))}
              </section>

              <TransactionsToolbar />

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.65fr)]">
                <TransactionsTable transactions={transactions} />
                <aside className="mt-6 space-y-6">
                  <WeeklyAIInsightsCard hasData={hasTransactions} />
                  <SavingGoalsCard hasData={hasTransactions} />
                  <QuickShortcutsCard />
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
