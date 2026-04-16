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

              return (
                <div key={budget.id || budget.category_name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#3c4a55]">
                      {budget.category_name || budget.name}
                    </span>
                    <span className="font-semibold text-[#9aa6b2]">
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f5]">
                    <div
                      className="h-full rounded-full bg-[#13a884] transition-all"
                      style={{ width: `${progress}%` }}
                    />
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
