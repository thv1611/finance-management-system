import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import StatCard from "../components/dashboard/StatCard";
import SpendingAnalytics from "../components/dashboard/SpendingAnalytics";
import BudgetSnapshot from "../components/dashboard/BudgetSnapshot";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import AIInsightCard from "../components/dashboard/AIInsightCard";
import QuickActions from "../components/dashboard/QuickActions";
import LoadingState from "../components/common/LoadingState";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency, getBudgetSummary, getTransactionSummary, useFinanceData } from "../lib/financeData";

export default function DashboardPage() {
  const { user } = getAuthSession();
  const { isLoading, transactions, budgets, reports } = useFinanceData();
  const userName = user?.name || "User";
  const transactionSummary = getTransactionSummary(transactions);
  const budgetSummary = getBudgetSummary(budgets);
  const hasTransactions = transactions.length > 0;
  const stats = [
    {
      icon: "wallet",
      label: "Total Balance",
      amount: formatCurrency(transactionSummary.net),
      trend: hasTransactions ? "Live" : "0%",
      tone: "positive",
    },
    {
      icon: "income",
      label: "Monthly Income",
      amount: formatCurrency(transactionSummary.income),
      trend: hasTransactions ? "Live" : "0%",
      tone: "positive",
    },
    {
      icon: "expense",
      label: "Monthly Expenses",
      amount: formatCurrency(transactionSummary.expenses),
      trend: hasTransactions ? "Live" : "0%",
      tone: hasTransactions ? "negative" : "positive",
    },
    {
      icon: "savings",
      label: "Monthly Savings",
      amount: formatCurrency(budgetSummary.remaining),
      trend: budgets.length ? "Live" : "0%",
      tone: "positive",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/45 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Dashboard" />

      <main className="relative z-0 lg:pl-[248px]">
        <DashboardHeader user={user} />

        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-4 md:px-8">
          <section className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#8d99a5]">Overview</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Dashboard</h1>
            <p className="mt-2 text-base font-medium text-[#687684]">
              Welcome back, {userName}. Here&apos;s your financial overview.
            </p>
          </section>

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(330px,0.9fr)]">
                <SpendingAnalytics data={reports.monthlyComparison} />
                <BudgetSnapshot budgets={budgets} />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
                <RecentTransactions transactions={transactions} />
                <div className="space-y-6">
                  <AIInsightCard hasData={hasTransactions || budgets.length > 0} />
                  <QuickActions />
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
