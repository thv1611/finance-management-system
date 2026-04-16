import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

function getRatioStatus(ratio) {
  if (ratio.totalIncome <= 0) {
    return "No Income";
  }

  if (ratio.savingRatio >= 50) {
    return "Excellent";
  }

  if (ratio.savingRatio >= 20) {
    return "Healthy";
  }

  if (ratio.savingRatio >= 0) {
    return "Needs Focus";
  }

  return "Overspending";
}

function getStrokeDasharray(value) {
  const circumference = 2 * Math.PI * 45;
  const normalized = Math.max(Math.min(Number(value || 0), 100), 0);
  return `${(normalized / 100) * circumference} ${circumference}`;
}

export default function SavingRatioCard({ ratio = null }) {
  return (
    <ReportCard title="Saving Ratio">
      {ratio !== null ? (
        <div className="flex flex-col items-center text-center">
        <div className="relative grid h-40 w-40 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#edf3f5" strokeWidth="13" />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#13977f"
              strokeDasharray={getStrokeDasharray(ratio.savingRatio)}
              strokeLinecap="round"
              strokeWidth="13"
            />
          </svg>
          <p className="absolute text-3xl font-black tracking-[-0.04em] text-[#1f2d38]">
            {Math.round(Number(ratio.savingRatio || 0))}%
          </p>
        </div>
        <p className="mt-1 text-sm font-bold text-[#8b98a5]">Target: 80%</p>
        <p className="mt-4 text-lg font-black text-[#119477]">{getRatioStatus(ratio)}</p>
          <p className="mt-2 max-w-[230px] text-sm font-semibold leading-6 text-[#7a8794]">
            Income {formatCurrency(ratio.totalIncome)} | Expense {formatCurrency(ratio.totalExpense)} | Savings{" "}
            {formatCurrency(ratio.savings)}
          </p>
        </div>
      ) : (
        <EmptyState title="No data available" message="Create savings goals to calculate your ratio." />
      )}
    </ReportCard>
  );
}
