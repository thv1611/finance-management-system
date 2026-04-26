import { useEffect, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { Icon } from "../components/dashboard/DashboardIcons";
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
import { formatCurrency } from "../lib/financeData";
import { buildReportsInsight } from "../lib/insightBuilder";
import { getCategories } from "../lib/transactionsApi";
import {
  exportReportsCsv,
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
  const [isExporting, setIsExporting] = useState(false);

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
  const leadingCategory = spendingByCategory[0];
  const topSpendingItem = topSpending[0];
  const savingsTone = Number(summary.savings || 0) >= 0 ? "positive" : "negative";
  const reportHeroStats = [
    {
      id: "net-savings",
      label: "Net savings",
      value: formatCurrency(summary.savings || 0, {
        sign: savingsTone === "positive" && Number(summary.savings || 0) > 0 ? "+" : "",
      }),
      caption:
        savingsTone === "positive"
          ? "Your current report window is still cash-flow positive."
          : "Expenses are outpacing income in this report window.",
      accentClass:
        savingsTone === "positive"
          ? "bg-[#ddf8ef] text-[#0d8f78]"
          : "bg-[#ffe6e6] text-[#bf5b5b]",
      icon: savingsTone === "positive" ? "savings" : "alert",
    },
    {
      id: "focus-category",
      label: "Focus category",
      value: leadingCategory ? leadingCategory.name : "No category yet",
      caption: leadingCategory
        ? `${Number(leadingCategory.percent || 0).toFixed(1)}% of current expenses`
        : "Add expense transactions to unlock category insight.",
      accentClass: "bg-[#e6f0ff] text-[#2d8ce9]",
      icon: "report",
    },
    {
      id: "top-ticket",
      label: "Largest pressure",
      value: topSpendingItem ? topSpendingItem.name : "No spending data",
      caption: topSpendingItem
        ? `${formatCurrency(topSpendingItem.amount || 0)} across ${topSpendingItem.count || 0} transactions`
        : "Track expenses to see what is hitting hardest.",
      accentClass: "bg-[#e7f7f0] text-[#13977f]",
      icon: "wallet",
    },
  ];

  async function handleExportCsv() {
    try {
      setIsExporting(true);
      setTone("neutral");
      setMessage("");
      const params = {
        range: filters.range,
        categoryIds: filters.categoryId || undefined,
      };
      const { blob, filename } = await exportReportsCsv(params);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setTone("success");
      setMessage("Report exported successfully.");
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to export report.");
    } finally {
      setIsExporting(false);
    }
  }

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
            onExportCsv={handleExportCsv}
            isExporting={isExporting}
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
              <section className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#143d52] via-[#1a6f88] to-[#5aa2d8] p-6 text-white shadow-[0_28px_70px_rgba(24,77,101,0.24)]">
                <div className="pointer-events-none absolute -right-16 top-[-32px] h-44 w-44 rounded-full bg-white/16 blur-2xl" />
                <div className="pointer-events-none absolute bottom-[-64px] left-[-14px] h-40 w-40 rounded-full bg-[#8ef0df]/18 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/82">
                      Dynamic Report View
                    </div>
                    <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] md:text-[2.6rem]">
                      Financial trends that explain what needs attention next.
                    </h2>
                    <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/82 md:text-base">
                      This report view combines cash flow, category pressure, and top-ticket spending so you can explain decisions clearly during your demo.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[640px]">
                    {reportHeroStats.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/66">
                            {item.label}
                          </span>
                          <span className={`grid h-10 w-10 place-items-center rounded-2xl ${item.accentClass}`}>
                            <Icon name={item.icon} className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-4 text-xl font-black tracking-[-0.03em] text-white">
                          {item.value}
                        </p>
                        <p className="mt-2 text-xs font-bold leading-5 text-white/72">
                          {item.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(260px,0.85fr)_minmax(380px,1.55fr)_minmax(240px,0.75fr)]">
                <div className="min-w-0 space-y-6">
                  <SpendingCategoryCard data={spendingByCategory} />
                  <SavingRatioCard ratio={hasSummaryData ? summary : null} />
                  <ReportSnapshotCard snapshot={summary.snapshot} />
                </div>

                <div className="min-w-0 space-y-6">
                  <MonthlyComparisonCard data={monthlyComparison.series} range={filters.range} />
                  <IncomeExpenseCard data={monthlyComparison.series} />
                </div>

                <div className="min-w-0 space-y-6">
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
