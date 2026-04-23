import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

function getBarHeight(value, maxValue) {
  if (!maxValue) {
    return 12;
  }

  return Math.max((Number(value || 0) / maxValue) * 150, 12);
}

function truncateLabel(label) {
  if (!label) {
    return "";
  }

  return label.length > 3 ? label.slice(0, 3) : label;
}

export default function IncomeExpenseCard({ data = [] }) {
  const maxValue = data.reduce(
    (max, item) => Math.max(max, Number(item.income || 0), Number(item.expense || 0)),
    0
  );

  const barCount = data.length;
  const isCompact = barCount > 7;

  return (
    <ReportCard title="Income vs Expense">
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <div
            className="flex items-end justify-between px-1"
            style={{
              minWidth: isCompact ? `${Math.max(barCount * 42, 280)}px` : undefined,
              gap: isCompact ? "2px" : "8px",
            }}
          >
            {data.map(({ label, income, expense }) => (
              <div
                key={label}
                className="flex flex-1 flex-col items-center"
                style={{ minWidth: 0, gap: isCompact ? "4px" : "8px" }}
              >
                <div
                  className="flex items-end justify-center"
                  style={{
                    height: "170px",
                    gap: isCompact ? "1px" : "3px",
                  }}
                >
                  <div
                    className="rounded-t-md bg-[#13977f] transition hover:opacity-80"
                    style={{
                      height: `${getBarHeight(income, maxValue)}px`,
                      width: isCompact ? "8px" : "16px",
                      minWidth: isCompact ? "6px" : "12px",
                    }}
                    title={`Income: ${income}`}
                  />
                  <div
                    className="rounded-t-md bg-[#2d8ce9] transition hover:opacity-80"
                    style={{
                      height: `${getBarHeight(expense, maxValue)}px`,
                      width: isCompact ? "8px" : "16px",
                      minWidth: isCompact ? "6px" : "12px",
                    }}
                    title={`Expense: ${expense}`}
                  />
                </div>
                <span
                  className="truncate text-center font-black text-[#9aa6b2]"
                  style={{
                    fontSize: isCompact ? "9px" : "11px",
                    maxWidth: isCompact ? "32px" : "48px",
                    lineHeight: 1.2,
                  }}
                  title={label}
                >
                  {isCompact ? truncateLabel(label) : label}
                </span>
              </div>
            ))}
          </div>

          {data.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-black text-[#8d99a5]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#13977f]" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#2d8ce9]" />
                Expense
              </span>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No data available" message="Income and expense charts appear after transactions exist." />
      )}
    </ReportCard>
  );
}
