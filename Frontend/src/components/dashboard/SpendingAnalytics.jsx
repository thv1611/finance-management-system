import { useEffect, useMemo, useRef, useState } from "react";
import { getDashboardSpendingAnalytics } from "../../lib/dashboardApi";
import { formatCurrency } from "../../lib/financeData";

const tabs = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Yearly", value: "yearly" },
];

const viewOptions = [
  { label: "Income + Expense", value: "both" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

const CHART_WIDTH = 680;
const CHART_HEIGHT = 300;
const CHART_PADDING = 28;

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildPolyline(values, width, height, padding, maxValue) {
  if (!values.length || maxValue <= 0) {
    return "";
  }

  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (usableWidth * index) / Math.max(values.length - 1, 1);
      const y = height - padding - (value / maxValue) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildChartPoints(values, width, height, padding, maxValue) {
  if (!values.length) {
    return [];
  }

  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values.map((value, index) => ({
    x: padding + (usableWidth * index) / Math.max(values.length - 1, 1),
    y: maxValue > 0 ? height - padding - (value / maxValue) * usableHeight : height - padding,
    value,
  }));
}

export default function SpendingAnalytics({ data: initialData }) {
  const hasBootstrapped = useRef(false);
  const [range, setRange] = useState(initialData?.range || "monthly");
  const [view, setView] = useState(initialData?.view || "both");
  const [data, setData] = useState(initialData || { range: "monthly", view: "both", series: [], max_value: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const series = data?.series || [];
  const hasData = series.some((item) => Number(item.income || 0) > 0 || Number(item.expense || 0) > 0);
  const labels = series.map((item) => item.label);
  const maxValue = Math.max(data?.max_value || 0, 1);
  const incomeValues = series.map((item) => Number(item.income || 0));
  const expenseValues = series.map((item) => Number(item.expense || 0));
  const incomePoints = buildPolyline(
    incomeValues,
    CHART_WIDTH,
    CHART_HEIGHT,
    CHART_PADDING,
    maxValue
  );
  const expensePoints = buildPolyline(
    expenseValues,
    CHART_WIDTH,
    CHART_HEIGHT,
    CHART_PADDING,
    maxValue
  );
  const incomeChartPoints = useMemo(
    () => buildChartPoints(incomeValues, CHART_WIDTH, CHART_HEIGHT, CHART_PADDING, maxValue),
    [incomeValues, maxValue]
  );
  const expenseChartPoints = useMemo(
    () => buildChartPoints(expenseValues, CHART_WIDTH, CHART_HEIGHT, CHART_PADDING, maxValue),
    [expenseValues, maxValue]
  );
  const activePoint = hoveredIndex === null ? null : {
    label: labels[hoveredIndex],
    income: incomeChartPoints[hoveredIndex],
    expense: expenseChartPoints[hoveredIndex],
  };

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setData(initialData);
    setRange(initialData.range || "monthly");
    setView(initialData.view || "both");
  }, [initialData]);

  useEffect(() => {
    if (!hasBootstrapped.current) {
      hasBootstrapped.current = true;
      return;
    }

    let isMounted = true;

    async function loadAnalytics() {
      try {
        setIsLoading(true);
        setError("");
        setHoveredIndex(null);
        const result = await getDashboardSpendingAnalytics({ range, view });

        if (isMounted) {
          setData(result.data || { range, view, series: [], max_value: 0 });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.response?.message || loadError.message || "Unable to load spending analytics.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [range, view]);

  const legendItems = [
    { key: "income", label: "Income", color: "#10966f", visible: view !== "expense" },
    { key: "expense", label: "Expenses", color: "#2c8dec", visible: view !== "income" },
  ].filter((item) => item.visible);

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Spending Analytics</h2>
          {hasData ? (
            <div className="mt-2 flex items-center gap-4 text-xs font-bold text-[#7f8c98]">
              {legendItems.map((item) => (
                <span key={item.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex rounded-lg bg-[#f1f5f7] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRange(tab.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  range === tab.value
                    ? "bg-white text-[#13907f] shadow-[0_6px_14px_rgba(30,62,82,0.08)]"
                    : "text-[#8a97a4] hover:text-[#26333e]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap rounded-lg bg-[#f1f5f7] p-1">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  view === option.value
                  ? "bg-white text-[#13907f] shadow-[0_6px_14px_rgba(30,62,82,0.08)]"
                  : "text-[#8a97a4] hover:text-[#26333e]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-[300px] overflow-hidden rounded-lg bg-gradient-to-b from-white to-[#fbfdfe]">
        {isLoading ? (
          <div className="flex h-full animate-pulse flex-col justify-center px-6">
            <div className="h-4 w-40 rounded-full bg-[#e4ecef]" />
            <div className="mt-6 h-44 rounded-lg bg-[#f1f5f7]" />
          </div>
        ) : hasData ? (
          <>
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              aria-label={`${range} spending line chart`}
            >
            {[60, 120, 180, 240].map((y) => (
              <line key={y} x1="20" x2="660" y1={y} y2={y} stroke="#edf2f5" strokeWidth="1" />
            ))}
              {view !== "expense" ? (
                <polyline
                  fill="none"
                  points={incomePoints}
                  stroke="#10966f"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {view !== "income" ? (
                <polyline
                  fill="none"
                  points={expensePoints}
                  stroke="#2c8dec"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {activePoint ? (
                <>
                  <line
                    x1={activePoint.income?.x || activePoint.expense?.x || CHART_PADDING}
                    x2={activePoint.income?.x || activePoint.expense?.x || CHART_PADDING}
                    y1={CHART_PADDING}
                    y2={CHART_HEIGHT - CHART_PADDING}
                    stroke="#d7e2e6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {view !== "expense" && activePoint.income ? (
                    <circle cx={activePoint.income.x} cy={activePoint.income.y} r="5.5" fill="#10966f" stroke="#ffffff" strokeWidth="3" />
                  ) : null}
                  {view !== "income" && activePoint.expense ? (
                    <circle cx={activePoint.expense.x} cy={activePoint.expense.y} r="5.5" fill="#2c8dec" stroke="#ffffff" strokeWidth="3" />
                  ) : null}
                </>
              ) : null}
              {series.map((item, index) => {
                const currentPoint = incomeChartPoints[index] || expenseChartPoints[index];
                const nextPoint = incomeChartPoints[index + 1] || expenseChartPoints[index + 1];
                const previousPoint = incomeChartPoints[index - 1] || expenseChartPoints[index - 1];
                const x = currentPoint?.x || CHART_PADDING;
                const nextX = nextPoint?.x ?? CHART_WIDTH - CHART_PADDING;
                const previousX = previousPoint?.x ?? CHART_PADDING;
                const startX = index === 0 ? CHART_PADDING : (previousX + x) / 2;
                const endX = index === series.length - 1 ? CHART_WIDTH - CHART_PADDING : (x + nextX) / 2;

                return (
                  <rect
                    key={item.label}
                    x={clampValue(startX, CHART_PADDING, CHART_WIDTH - CHART_PADDING)}
                    y={0}
                    width={Math.max(endX - startX, 18)}
                    height={CHART_HEIGHT}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseMove={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
            {activePoint ? (
              <div
                className="pointer-events-none absolute z-10 min-w-[148px] rounded-lg border border-[#dce6ea] bg-white/96 px-3 py-2 shadow-[0_16px_32px_rgba(35,66,85,0.14)]"
                style={{
                  left: `${((activePoint.income?.x || activePoint.expense?.x || CHART_PADDING) / CHART_WIDTH) * 100}%`,
                  top: `${((Math.min(activePoint.income?.y ?? CHART_HEIGHT, activePoint.expense?.y ?? CHART_HEIGHT) - 18) / CHART_HEIGHT) * 100}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8d99a5]">{activePoint.label}</p>
                {view !== "expense" ? (
                  <p className="mt-1 text-sm font-bold text-[#25313b]">Income: {formatCurrency(activePoint.income?.value || 0)}</p>
                ) : null}
                {view !== "income" ? (
                  <p className="mt-1 text-sm font-bold text-[#25313b]">Expense: {formatCurrency(activePoint.expense?.value || 0)}</p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 h-12 w-12 rounded-lg bg-[#fff1f1]" />
            <p className="text-lg font-black text-[#25313b]">Unable to load analytics</p>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#7a8794]">{error}</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 h-12 w-12 rounded-lg bg-[#e7f7f0]" />
            <p className="text-lg font-black text-[#25313b]">No spending data yet</p>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#7a8794]">
              Add transactions to unlock analytics and trends.
            </p>
          </div>
        )}
        {!isLoading && hasData && (
          <div
            className="absolute bottom-4 left-0 right-0 grid px-7 text-center text-xs font-semibold text-[#9aa6b2]"
            style={{ gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, minmax(0, 1fr))` }}
          >
            {labels.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
