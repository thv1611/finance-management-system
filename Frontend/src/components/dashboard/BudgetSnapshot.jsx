import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function BudgetSnapshot({ snapshot }) {
  const items = snapshot?.items || [];

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Budget Snapshot</h2>
      {items.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#f5f8fa] p-4 text-sm font-semibold text-[#6d7a86]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9aa6b2]">Budgets</p>
              <p className="mt-1 text-base font-black text-[#25313b]">{snapshot.total_budgets}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9aa6b2]">Overspent</p>
              <p className="mt-1 text-base font-black text-[#25313b]">{snapshot.overspent_categories_count}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9aa6b2]">Budgeted</p>
              <p className="mt-1 text-base font-black text-[#25313b]">
                {formatCurrency(snapshot.total_budget_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9aa6b2]">Spent</p>
              <p className="mt-1 text-base font-black text-[#25313b]">
                {formatCurrency(snapshot.total_spent_amount)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {items.map((budget) => {
              const limit = Number(budget.amount_limit || budget.limit || 0);
              const spent = Number(budget.spent || 0);
              const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOverspent = Number(budget.spent || 0) > limit;
              const isWarning = !isOverspent && progress >= 80;
              const barColor = isOverspent
                ? "bg-[#e05b62]"
                : isWarning
                  ? "bg-[#f0a33b]"
                  : "bg-[#13a884]";
              const statusLabel = isOverspent
                ? "Over limit"
                : isWarning
                  ? "Watch closely"
                  : "Healthy";

              return (
                <div key={budget.id || budget.category_name} className="rounded-xl border border-[#edf2f5] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <span className="font-bold text-[#3c4a55]">
                        {budget.category_name || budget.name}
                      </span>
                      <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${
                        isOverspent
                          ? "bg-[#fff1f1] text-[#d9515c]"
                          : isWarning
                            ? "bg-[#fff5e8] text-[#bf7d11]"
                            : "bg-[#eaf8f2] text-[#138a70]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f5]">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.06em] text-[#98a5b1]">
                    <span>{Number(progress).toFixed(0)}% used</span>
                    <span>
                      {isOverspent
                        ? `${formatCurrency(spent - limit)} over`
                        : `${formatCurrency(Math.max(limit - spent, 0))} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-7 rounded-lg bg-[#f5f8fa] px-4 py-4 text-sm font-semibold leading-6 text-[#6d7a86]">
            {snapshot.total_budgets} budgets tracked this month with{" "}
            {formatCurrency(snapshot.total_spent_amount)} spent out of{" "}
            {formatCurrency(snapshot.total_budget_amount)}.
          </div>
        </>
      ) : (
        <EmptyState
          className="mt-6"
          title="No budgets yet"
          message="Create a budget to see spending progress by category."
        />
      )}
    </section>
  );
}
