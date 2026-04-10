import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function SpendingCategoryCard({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <ReportCard title="Spending by Category">
      {data.length > 0 ? (
        <div className="flex flex-col items-center">
        <div className="relative grid h-52 w-52 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#edf3f5" strokeWidth="16" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="#13977f" strokeDasharray="118 283" strokeDashoffset="0" strokeLinecap="round" strokeWidth="16" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="#2d8ce9" strokeDasharray="79 283" strokeDashoffset="-128" strokeLinecap="round" strokeWidth="16" />
            <circle cx="60" cy="60" r="45" fill="none" stroke="#88d9cd" strokeDasharray="42 283" strokeDashoffset="-217" strokeLinecap="round" strokeWidth="16" />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-black tracking-[-0.04em] text-[#1f2d38]">{formatCurrency(total)}</p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9aa6b2]">Total</p>
          </div>
        </div>

        <div className="mt-5 w-full space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-lg px-2 py-1.5">
              <span className="flex items-center gap-3 text-sm font-bold text-[#52616d]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || "#13977f" }} />
                {item.name}
              </span>
              <span className="text-sm font-black text-[#1f2d38]">{item.percent || 0}%</span>
            </div>
          ))}
        </div>
        </div>
      ) : (
        <EmptyState title="No data available" message="Category analytics will appear after transactions are added." />
      )}
    </ReportCard>
  );
}
