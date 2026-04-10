import { Icon } from "../dashboard/DashboardIcons";
import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function TopSpendingCard({ items = [] }) {
  return (
    <ReportCard title="Top Spending">
      {items.length > 0 ? (
        <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[#f7fafb]">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef7fb] text-[#2d8ce9]">
              <Icon name={item.icon || "card"} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#2b3945]">{item.name}</p>
              <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">{item.count || 0} transactions</p>
            </div>
            <p className="text-sm font-black text-[#1f2d38]">{formatCurrency(item.amount)}</p>
          </div>
        ))}
        </div>
      ) : (
        <EmptyState title="No data available" message="Top spending categories will appear after expenses are tracked." />
      )}
    </ReportCard>
  );
}
