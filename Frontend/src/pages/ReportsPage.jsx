import { useEffect, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
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
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";
import { buildReportsInsight } from "../lib/insightBuilder";
import { getCategories } from "../lib/transactionsApi";
import {
  getMonthlyComparisonReport,
  getReportsSummary,
  getSpendingByCategory,
  getTopSpendingReport,
} from "../lib/reportsApi";

const EMPTY_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  savings: 0,
  savingRatio: 0,
  snapshot: null,
};

const EMPTY_MONTHLY_COMPARISON = {
  range: "week",
  granularity: "day",
  startDate: null,
  endDate: null,
  maxValue: 0,
  series: [],
};

export default function ReportsPage() {
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const [filters, setFilters] = useState({
    range: "week",
    categoryId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [spendingByCategory, setSpendingByCategoryData] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState(EMPTY_MONTHLY_COMPARISON);
  const [topSpending, setTopSpending] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const result = await getCategories("expense");

        if (isMounted) {
          setCategories(result.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setTone("error");
          setMessage(error.response?.message || error.message || "Unable to load report filters.");
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setIsLoading(true);
        setMessage("");
        const params = {
          range: filters.range,
          categoryIds: filters.categoryId || undefined,
        };
        const results = await Promise.allSettled([
          getReportsSummary(params),
          getSpendingByCategory(params),
          getMonthlyComparisonReport(params),
          getTopSpendingReport(params),
        ]);

        if (!isMounted) {
          return;
        }

        const [summaryResult, categoryResult, comparisonResult, topSpendingResult] = results;
        const failedResult = results.find((result) => result.status === "rejected");

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value.data || EMPTY_SUMMARY);
        } else {
          setSummary(EMPTY_SUMMARY);
        }

        if (categoryResult.status === "fulfilled") {
          setSpendingByCategoryData(categoryResult.value.data || []);
        } else {
          setSpendingByCategoryData([]);
        }

        if (comparisonResult.status === "fulfilled") {
          setMonthlyComparison(comparisonResult.value.data || EMPTY_MONTHLY_COMPARISON);
        } else {
          setMonthlyComparison(EMPTY_MONTHLY_COMPARISON);
        }

        if (topSpendingResult.status === "fulfilled") {
          setTopSpending(topSpendingResult.value.data || []);
        } else {
          setTopSpending([]);
        }

        if (failedResult) {
          setTone("error");
          setMessage(
            failedResult.reason?.response?.message ||
              failedResult.reason?.message ||
              "Some report data could not be loaded."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const hasSummaryData = summary.totalIncome > 0 || summary.totalExpense > 0;
  const reportInsight = buildReportsInsight({
    summary,
    spendingByCategory,
    topSpending,
    rangeLabel: filters.range,
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Reports" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-8 lg:py-8">
          <ReportsHeader
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenNotifications={onOpenNotifications}
            onDismissNotification={onDismissNotification}
          />
          <ReportsFilters
            range={filters.range}
            onRangeChange={(range) => setFilters((prev) => ({ ...prev, range }))}
            categoryId={filters.categoryId}
            onCategoryChange={(event) =>
              setFilters((prev) => ({ ...prev, categoryId: event.target.value }))
            }
            categories={categories}
          />

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <LoadingState label="Loading reports..." />
          ) : (
            <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(420px,1.55fr)_minmax(260px,0.75fr)]">
            <div className="space-y-6">
              <SpendingCategoryCard data={spendingByCategory} />
              <SavingRatioCard ratio={hasSummaryData ? summary : null} />
              <ReportSnapshotCard snapshot={summary.snapshot} />
            </div>

            <div className="space-y-6">
              <MonthlyComparisonCard data={monthlyComparison.series} range={filters.range} />
              <IncomeExpenseCard data={monthlyComparison.series} />
            </div>

            <div className="space-y-6">
              <TopSpendingCard items={topSpending} />
            </div>
          </section>

          <AIAnalysisSection {...reportInsight} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
