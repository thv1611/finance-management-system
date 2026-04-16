import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

function getBarHeight(value, maxValue) {
  if (!maxValue) {
    return 12;
  }

  return Math.max((Number(value || 0) / maxValue) * 170, 12);
}

export default function IncomeExpenseCard({ data = [] }) {
  const maxValue = data.reduce(
    (max, item) => Math.max(max, Number(item.income || 0), Number(item.expense || 0)),
    0
  );

  return (
    <ReportCard title="Income vs Expense">
      {data.length > 0 ? (
        <div className="flex h-[230px] items-end justify-between gap-4 px-2">
        {data.map(({ label, income, expense }) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-[170px] items-end gap-2">
              <div
                className="w-5 rounded-t-lg bg-[#13977f] transition hover:opacity-80"
                style={{ height: `${getBarHeight(income, maxValue)}px` }}
                title={`Income: ${income}`}
              />
              <div
                className="w-5 rounded-t-lg bg-[#2d8ce9] transition hover:opacity-80"
                style={{ height: `${getBarHeight(expense, maxValue)}px` }}
                title={`Expense: ${expense}`}
              />
            </div>
            <span className="text-xs font-black text-[#9aa6b2]">{label}</span>
          </div>
        ))}
        </div>
      ) : (
        <EmptyState title="No data available" message="Income and expense charts appear after transactions exist." />
      )}
    </ReportCard>
  );
}
