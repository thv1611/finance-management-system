import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

const colors = {
  good: "#13977f",
  info: "#2d8ce9",
  full: "#5d6fbd",
  danger: "#ed5965",
};

export default function CategoryLimitsCard({
  budgets = [],
  onCreateBudget,
  onEditBudget,
  onDeleteBudget,
  deletingId = null,
}) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-[-0.02em] text-[#25313b]">Category Limits</h2>
        <span className="text-sm font-black text-[#13977f]">{budgets.length} Budgets</span>
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-7">
          {budgets.map((budget) => {
            const spent = Number(budget.spent || 0);
            const limit = Number(budget.amount_limit || budget.limit || 0);
            const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const over = spent > limit;
            const remaining = limit - spent;
            const tone = over ? "danger" : progress > 75 ? "full" : "good";

            return (
              <div key={budget.id || budget.name} className="group">
                <div className="mb-3 flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef4fb] text-[#5973c7] transition group-hover:bg-[#e5f7f2] group-hover:text-[#13977f]">
                    <Icon name={budget.icon || "wallet"} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#34424d]">
                      {budget.category_name || budget.name}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[#9aa6b2]">
                      {Math.round(progress)}% used
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${over ? "text-[#dd4d58]" : "text-[#34424d]"}`}>
                      {formatCurrency(spent)} <span className="text-[#8e9aa5]">of {formatCurrency(limit)}</span>
                    </p>
                    <p className={`mt-1 text-xs font-bold ${over ? "text-[#dd4d58]" : "text-[#8e9aa5]"}`}>
                      {over ? `Overspent by ${formatCurrency(spent - limit)}` : `${formatCurrency(remaining)} remaining`}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEditBudget?.(budget)}
                        className="text-xs font-black uppercase tracking-[0.08em] text-[#13977f] transition hover:text-[#0c6f62]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBudget?.(budget)}
                        disabled={deletingId === budget.id}
                        className="text-xs font-black uppercase tracking-[0.08em] text-[#dd4d58] transition hover:text-[#bf3643] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === budget.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f5]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, backgroundColor: colors[tone] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No category limits yet"
          message="Create your first budget to start tracking limits by category."
          actionLabel="+ Create Budget"
          onAction={onCreateBudget}
        />
      )}
    </section>
  );
}
