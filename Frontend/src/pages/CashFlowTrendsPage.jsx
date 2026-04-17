import { useEffect, useMemo, useState } from "react";
import CashFlowChartCard from "../components/cashflow/CashFlowChartCard";
import CashFlowFilters from "../components/cashflow/CashFlowFilters";
import CashFlowHeader from "../components/cashflow/CashFlowHeader";
import CashFlowInsightCard from "../components/cashflow/CashFlowInsightCard";
import CashFlowSummaryCard from "../components/cashflow/CashFlowSummaryCard";
import CategoryTrendsCard from "../components/cashflow/CategoryTrendsCard";
import ExportTrendReportCard from "../components/cashflow/ExportTrendReportCard";
import AuthMessage from "../components/auth/AuthMessage";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency } from "../lib/financeData";
import { buildCashFlowInsight } from "../lib/insightBuilder";
import {
  getMonthlyComparisonReport,
  getReportsSummary,
  getTopSpendingReport,
} from "../lib/reportsApi";

const RANGE_TO_QUERY = {
  Weekly: "week",
  Monthly: "month",
  Yearly: "year",
};

const EMPTY_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  savings: 0,
  startDate: null,
  endDate: null,
};

function escapeCsvValue(value) {
  const normalizedValue = String(value ?? "");

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, "\"\"")}"`;
  }

  return normalizedValue;
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function getDaySpan(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffInDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return diffInDays > 0 ? diffInDays : 0;
}

function getMetricValue(metric, summary) {
  if (metric === "Income") {
    return summary.totalIncome;
  }

  if (metric === "Expenses") {
    return summary.totalExpense;
  }

  return summary.savings;
}

export default function CashFlowTrendsPage() {
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const [activeRange, setActiveRange] = useState("Weekly");
  const [activeMetric, setActiveMetric] = useState("Difference");
  const [isLoading, setIsLoading] = useState(true);
  const [tone, setTone] = useState("neutral");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [categoryTrends, setCategoryTrends] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCashFlowData() {
      try {
        setIsLoading(true);
        setMessage("");
        const params = {
          range: RANGE_TO_QUERY[activeRange] || "week",
        };
        const results = await Promise.allSettled([
          getReportsSummary(params),
          getMonthlyComparisonReport(params),
          getTopSpendingReport(params),
        ]);

        if (!isMounted) {
          return;
        }

        const [summaryResult, comparisonResult, topSpendingResult] = results;
        const failedResult = results.find((result) => result.status === "rejected");

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value.data || EMPTY_SUMMARY);
        } else {
          setSummary(EMPTY_SUMMARY);
        }

        if (comparisonResult.status === "fulfilled") {
          const series = comparisonResult.value.data?.series || [];
          setCashFlowData(
            series.map((item) => ({
              date: item.label,
              income: Number(item.income || 0),
              expenses: Number(item.expense || 0),
            }))
          );
        } else {
          setCashFlowData([]);
        }

        if (topSpendingResult.status === "fulfilled") {
          setCategoryTrends(
            (topSpendingResult.value.data || []).map((item) => ({
              name: item.name,
              amount: Number(item.amount || 0),
              count: Number(item.count || 0),
              icon: item.icon || "card",
              tone: "negative",
              trend: "Live",
            }))
          );
        } else {
          setCategoryTrends([]);
        }

        if (failedResult) {
          setTone("error");
          setMessage(
            failedResult.reason?.response?.message ||
              failedResult.reason?.message ||
              "Some cash-flow data could not be loaded."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCashFlowData();

    return () => {
      isMounted = false;
    };
  }, [activeRange]);

  const hasData = cashFlowData.length > 0;
  const daySpan = getDaySpan(summary.startDate, summary.endDate);
  const primaryMetricValue = getMetricValue(activeMetric, summary);
  const primaryMetricLabel = useMemo(() => {
    if (activeMetric === "Income") {
      return "Total Income";
    }

    if (activeMetric === "Expenses") {
      return "Total Expenses";
    }

    return "Net Difference";
  }, [activeMetric]);

  const summaries = [
    [
      primaryMetricLabel,
      `${activeMetric === "Difference" && primaryMetricValue < 0 ? "-" : ""}${formatCurrency(primaryMetricValue)}`,
      hasData ? "Live" : "0%",
      activeMetric === "Expenses" ? "negative" : "positive",
    ],
    ["Total Income", formatCurrency(summary.totalIncome), hasData ? "Live" : "0%", "positive"],
    [
      "Total Expenses",
      formatCurrency(summary.totalExpense),
      hasData ? "Live" : "0%",
      hasData ? "negative" : "positive",
    ],
    [
      "Avg Daily Flow",
      formatCurrency(daySpan > 0 ? summary.savings / daySpan : 0),
      hasData ? `${daySpan}d` : "0%",
      summary.savings >= 0 ? "positive" : "negative",
    ],
  ];
  const cashFlowInsight = buildCashFlowInsight({
    summary,
    categoryTrends,
    activeRange,
  });

  function handleExportTrendReport() {
    const rangeKey = RANGE_TO_QUERY[activeRange] || "week";
    const rows = [
      ["Section", "Label", "Value 1", "Value 2", "Value 3"],
      ["Summary", "Range", activeRange, summary.startDate || "", summary.endDate || ""],
      ["Summary", "Metric View", activeMetric, "", ""],
      ["Summary", "Total Income", summary.totalIncome, "", ""],
      ["Summary", "Total Expenses", summary.totalExpense, "", ""],
      ["Summary", "Net Savings", summary.savings, "", ""],
      [],
      ["Cash Flow Series", "Period", "Income", "Expenses", "Net"],
      ...cashFlowData.map((item) => [
        "Cash Flow Series",
        item.date,
        item.income,
        item.expenses,
        Number(item.income || 0) - Number(item.expenses || 0),
      ]),
      [],
      ["Top Categories", "Category", "Amount", "Transactions", "Trend"],
      ...categoryTrends.map((item) => [
        "Top Categories",
        item.name,
        item.amount,
        item.count,
        item.trend || "",
      ]),
    ];

    downloadCsv(`cash-flow-${rangeKey}-report.csv`, rows);
    setTone("neutral");
    setMessage("Trend report exported as CSV.");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Reports" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:py-8">
          <CashFlowHeader
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenNotifications={onOpenNotifications}
            onDismissNotification={onDismissNotification}
          />
          <CashFlowFilters
            activeRange={activeRange}
            activeMetric={activeMetric}
            onRangeChange={setActiveRange}
            onMetricChange={setActiveMetric}
          />
          <AuthMessage tone={tone} message={message} />
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
          <CashFlowChartCard data={cashFlowData} />

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaries.map(([title, value, badge, tone]) => (
              <CashFlowSummaryCard key={title} title={title} value={value} badge={badge} tone={tone} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <CategoryTrendsCard categories={categoryTrends} />
            <div className="space-y-6">
              <CashFlowInsightCard {...cashFlowInsight} />
              <ExportTrendReportCard onExport={handleExportTrendReport} disabled={!hasData} />
            </div>
          </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
