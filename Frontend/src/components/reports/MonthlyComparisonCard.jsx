import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

function buildChartPath(data, key, minY, maxY) {
  if (!data.length) {
    return "";
  }

  const width = 655;
  const left = 35;
  const top = 35;
  const bottom = 235;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const maxValue = Math.max(maxY, 1);
  const points = data.map((item, index) => {
    const value = Number(item[key] || 0);
    const x = left + step * index;
    const y = bottom - (value / maxValue) * (bottom - top);
    return `${index === 0 ? "M" : "L"} ${x} ${Math.max(y, minY)}`;
  });

  return points.join(" ");
}

function buildAreaPath(path, baselineY = 270) {
  if (!path) {
    return "";
  }

  const lastSegment = path.trim().split(" ").slice(-2);
  const firstSegment = path.trim().split(" ").slice(1, 3);
  const lastX = lastSegment[0];
  const firstX = firstSegment[0];

  return `${path} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs font-black text-[#6b7884]">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#13977f]" />
        Income
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2d8ce9]" />
        Expenses
      </span>
    </div>
  );
}

function getSubtitle(range) {
  if (range === "year") {
    return "Trend over this year";
  }

  if (range === "month") {
    return "Trend over this month";
  }

  return "Trend over this week";
}

export default function MonthlyComparisonCard({ data = [], range = "week" }) {
  const incomePath = buildChartPath(data, "income", 35, Math.max(...data.map((item) => Math.max(item.income || 0, item.expense || 0)), 0));
  const expensePath = buildChartPath(data, "expense", 35, Math.max(...data.map((item) => Math.max(item.income || 0, item.expense || 0)), 0));

  return (
    <ReportCard title="Monthly Comparison" subtitle={getSubtitle(range)} action={<Legend />}>
      <div className="relative h-[270px] overflow-hidden rounded-lg bg-gradient-to-b from-white to-[#fbfdfe]">
        {data.length > 0 ? (
          <svg className="h-full w-full" viewBox="0 0 720 270" preserveAspectRatio="none">
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#13977f" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#13977f" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2d8ce9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2d8ce9" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[55, 105, 155, 205].map((y) => (
            <line key={y} x1="25" x2="695" y1={y} y2={y} stroke="#edf2f5" strokeWidth="1" />
          ))}
          <path d={incomePath} fill="none" stroke="#13977f" strokeLinecap="round" strokeWidth="4" />
          <path d={buildAreaPath(incomePath)} fill="url(#incomeFill)" />
          <path d={expensePath} fill="none" stroke="#2d8ce9" strokeLinecap="round" strokeWidth="4" />
          <path d={buildAreaPath(expensePath)} fill="url(#expenseFill)" />
          {data.map((item, index) => {
            const width = 655;
            const left = 35;
            const step = data.length > 1 ? width / (data.length - 1) : 0;
            const x = left + step * index;

            return (
              <text
                key={item.label}
                x={x}
                y="258"
                textAnchor="middle"
                className="fill-[#9aa6b2] text-[10px] font-black"
              >
                {item.label}
              </text>
            );
          })}
          </svg>
        ) : (
          <EmptyState className="h-full" title="No data available" message="Income and expense trends require transaction history." />
        )}
      </div>
    </ReportCard>
  );
}
