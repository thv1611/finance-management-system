import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

export default function IncomeExpenseCard({ data = [] }) {
  return (
    <ReportCard title="Income vs Expense">
      {data.length > 0 ? (
        <div className="flex h-[230px] items-end justify-between gap-4 px-2">
        {data.map(({ day, income, expense }) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-[170px] items-end gap-2">
              <div className="w-5 rounded-t-lg bg-[#13977f] transition hover:opacity-80" style={{ height: `${income}px` }} />
              <div className="w-5 rounded-t-lg bg-[#2d8ce9] transition hover:opacity-80" style={{ height: `${expense}px` }} />
            </div>
            <span className="text-xs font-black text-[#9aa6b2]">{day}</span>
          </div>
        ))}
        </div>
      ) : (
        <EmptyState title="No data available" message="Income and expense charts appear after transactions exist." />
      )}
    </ReportCard>
  );
}
