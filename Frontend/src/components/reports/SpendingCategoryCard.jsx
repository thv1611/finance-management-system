import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

function buildSegments(data) {
  const circumference = 2 * Math.PI * 45;
  let offset = 0;

  return data.map((item) => {
    const percent = Number(item.percent || 0);
    const length = (percent / 100) * circumference;
    const segment = {
      ...item,
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset,
    };

    offset += length;
    return segment;
  });
}

export default function SpendingCategoryCard({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const segments = buildSegments(data);

  return (
    <ReportCard title="Spending by Category">
      {data.length > 0 ? (
        <div className="flex flex-col items-center">
        <div className="relative grid h-52 w-52 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#edf3f5" strokeWidth="16" />
            {segments.map((item) => (
              <circle
                key={item.name}
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={item.color || "#13977f"}
                strokeDasharray={item.dashArray}
                strokeDashoffset={item.dashOffset}
                strokeLinecap="round"
                strokeWidth="16"
              />
            ))}
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
              <span className="text-sm font-black text-[#1f2d38]">{Number(item.percent || 0).toFixed(1)}%</span>
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
