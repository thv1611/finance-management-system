import { useEffect, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import StatCard from "../components/dashboard/StatCard";
import DashboardHighlights from "../components/dashboard/DashboardHighlights";
import SpendingAnalytics from "../components/dashboard/SpendingAnalytics";
import BudgetSnapshot from "../components/dashboard/BudgetSnapshot";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import AIInsightCard from "../components/dashboard/AIInsightCard";
import QuickActions from "../components/dashboard/QuickActions";
import LoadingState from "../components/common/LoadingState";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency } from "../lib/financeData";
import { buildDashboardInsight } from "../lib/insightBuilder";
import {
  getDashboardBudgetSnapshot,
  getRecentDashboardTransactions,
  getDashboardSpendingAnalytics,
  getDashboardSummary,
} from "../lib/dashboardApi";

const EMPTY_SUMMARY = {
  total_balance: 0,
  monthly_income: 0,
  monthly_expenses: 0,
  monthly_savings: 0,
};

const EMPTY_BUDGET_SNAPSHOT = {
  total_budgets: 0,
  total_budget_amount: 0,
  total_spent_amount: 0,
  overspent_categories_count: 0,
  items: [],
};

const EMPTY_ANALYTICS = {
  range: "monthly",
  view: "both",
  series: [],
  max_value: 0,
};

function getTransactionIcon(type) {
  return type === "income" ? "income" : "expense";
}

function mapRecentTransaction(transaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    category: transaction.category_name || "Uncategorized",
    description: transaction.title || transaction.description || "Untitled transaction",
    status: "Completed",
    icon: getTransactionIcon(transaction.type),
    date: transaction.transaction_date,
  };
}

export default function DashboardPage() {
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetSnapshot, setBudgetSnapshot] = useState(EMPTY_BUDGET_SNAPSHOT);
  const [spendingAnalytics, setSpendingAnalytics] = useState(EMPTY_ANALYTICS);
  const userName = user?.name || "User";

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setMessage("");

        const results = await Promise.allSettled([
          getDashboardSummary(),
          getRecentDashboardTransactions(),
          getDashboardBudgetSnapshot(),
          getDashboardSpendingAnalytics(),
        ]);

        if (!isMounted) {
          return;
        }

        const [summaryResult, recentResult, budgetResult, analyticsResult] = results;
        const failedResult = results.find((result) => result.status === "rejected");

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value.data || EMPTY_SUMMARY);
        }

        if (recentResult.status === "fulfilled") {
          setRecentTransactions((recentResult.value.data || []).map(mapRecentTransaction));
        }

        if (budgetResult.status === "fulfilled") {
          setBudgetSnapshot(budgetResult.value.data || EMPTY_BUDGET_SNAPSHOT);
        }

        if (analyticsResult.status === "fulfilled") {
          setSpendingAnalytics(analyticsResult.value.data || EMPTY_ANALYTICS);
        }

        if (failedResult) {
          setTone("error");
          setMessage(
            failedResult.reason?.response?.message ||
              failedResult.reason?.message ||
              "Some dashboard data could not be loaded."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardInsight = buildDashboardInsight({
    summary,
    recentTransactions,
    budgetSnapshot,
  });
  const savingsRatio = summary.monthly_income > 0 ? (summary.monthly_savings / summary.monthly_income) * 100 : 0;
  const expenseRatio = summary.monthly_income > 0 ? (summary.monthly_expenses / summary.monthly_income) * 100 : 0;
  const overspentCount = Number(budgetSnapshot.overspent_categories_count || 0);
  const budgetWarningCount = (budgetSnapshot.items || []).filter(
    (item) => !item.overspent && Number(item.progress || 0) >= 80
  ).length;
  const stats = [
    {
      icon: "wallet",
      label: "Total Balance",
      amount: formatCurrency(summary.total_balance),
      trend: summary.total_balance >= 0 ? "Stable" : "Alert",
      tone: summary.total_balance >= 0 ? "positive" : "negative",
      caption:
        summary.total_balance >= 0
          ? "Net position across all recorded transactions."
          : "Your recorded outflow is ahead of inflow.",
    },
    {
      icon: "income",
      label: "Monthly Income",
      amount: formatCurrency(summary.monthly_income),
      trend: summary.monthly_income > 0 ? "Active" : "Quiet",
      tone: "positive",
      caption:
        summary.monthly_income > 0
          ? `${formatCurrency(summary.monthly_income - summary.monthly_expenses)} net room after expenses.`
          : "Log income entries to unlock stronger monthly analysis.",
    },
    {
      icon: "expense",
      label: "Monthly Expenses",
      amount: formatCurrency(summary.monthly_expenses),
      trend: summary.monthly_income > 0 ? `${Math.round(expenseRatio)}%` : "Track",
      tone: summary.monthly_expenses > 0 ? "negative" : "positive",
      caption:
        summary.monthly_income > 0
          ? "Share of this month's income already used."
          : "Your cost trend becomes clearer once income is logged too.",
    },
    {
      icon: "savings",
      label: "Monthly Savings",
      amount: formatCurrency(summary.monthly_savings),
      trend: summary.monthly_income > 0 ? `${Math.round(Math.abs(savingsRatio))}%` : "Track",
      tone: summary.monthly_savings >= 0 ? "positive" : "negative",
      caption:
        overspentCount > 0
          ? `${overspentCount} budget ${overspentCount > 1 ? "categories are" : "category is"} already over limit.`
          : budgetWarningCount > 0
            ? `${budgetWarningCount} budget ${budgetWarningCount > 1 ? "categories are" : "category is"} close to the limit.`
            : "No budget category is currently in the danger zone.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/45 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Dashboard" />

      <main className="relative z-0 lg:pl-[248px]">
        <DashboardHeader
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          onOpenNotifications={onOpenNotifications}
          onDismissNotification={onDismissNotification}
        />

        <div className="mx-auto max-w-[1380px] px-4 pb-10 pt-4 md:px-8">
          <section className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#8d99a5]">Overview</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Dashboard</h1>
            <p className="mt-2 text-base font-medium text-[#687684]">
              Welcome back, {userName}. Here&apos;s your financial overview.
            </p>
          </section>

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <LoadingState label="Loading dashboard..." />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </section>

              <DashboardHighlights
                monthlyIncome={summary.monthly_income}
                monthlyExpenses={summary.monthly_expenses}
                monthlySavings={summary.monthly_savings}
                budgetSnapshot={budgetSnapshot}
                recentTransactions={recentTransactions}
              />

              <section className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.72fr)_360px]">
                <div className="min-w-0 space-y-6">
                  <SpendingAnalytics data={spendingAnalytics} />
                  <RecentTransactions transactions={recentTransactions} />
                </div>
                <div className="min-w-0 space-y-6 xl:sticky xl:top-24">
                  <BudgetSnapshot snapshot={budgetSnapshot} />
                  <AIInsightCard {...dashboardInsight} />
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
