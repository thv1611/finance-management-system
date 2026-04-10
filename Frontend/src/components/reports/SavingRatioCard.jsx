import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

export default function SavingRatioCard({ ratio = null }) {
  return (
    <ReportCard title="Saving Ratio">
      {ratio ? (
        <div className="flex flex-col items-center text-center">
        <div className="relative grid h-40 w-40 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#edf3f5" strokeWidth="13" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="#13977f" strokeDasharray="212 283" strokeLinecap="round" strokeWidth="13" />
          </svg>
          <p className="absolute text-3xl font-black tracking-[-0.04em] text-[#1f2d38]">75%</p>
        </div>
        <p className="mt-1 text-sm font-bold text-[#8b98a5]">Target: 80%</p>
        <p className="mt-4 text-lg font-black text-[#119477]">Excellent</p>
          <p className="mt-2 max-w-[230px] text-sm font-semibold leading-6 text-[#7a8794]">
            Savings progress updates from your goals and transactions.
          </p>
        </div>
      ) : (
        <EmptyState title="No data available" message="Create savings goals to calculate your ratio." />
      )}
    </ReportCard>
  );
}
