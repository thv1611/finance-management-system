import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function CategoryTrendsCard({ categories = [] }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-[-0.02em] text-[#25313b]">Category Trends</h2>
        <Link to="/transactions" className="text-sm font-black text-[#13977f] transition hover:text-[#0c6f62]">
          View All
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-5">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center gap-4 rounded-lg p-2 transition hover:bg-[#f7fafb]">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef7fb] text-[#2d8ce9]">
              <Icon name={category.icon || "card"} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#34424d]">{category.name}</p>
              <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">{category.count || 0} transactions this month</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-[#1f2d38]">{formatCurrency(category.amount)}</p>
              <p className={`mt-1 text-xs font-black ${category.tone === "positive" ? "text-[#129477]" : "text-[#dd4d58]"}`}>
                {category.trend || "Live"}
              </p>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <EmptyState title="No data available" message="Category trends require transaction history." />
      )}
    </section>
  );
}
