import EmptyState from "../common/EmptyState";

export default function BudgetSnapshot({ budgets = [] }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Budget Snapshot</h2>
      {budgets.length > 0 ? (
        <>
          <div className="mt-6 space-y-5">
            {budgets.map((budget) => {
              const limit = Number(budget.limit || 0);
              const spent = Number(budget.spent || 0);
              const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

              return (
                <div key={budget.id || budget.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#3c4a55]">{budget.name}</span>
                    <span className="font-semibold text-[#9aa6b2]">
                      ${spent.toLocaleString()} / ${limit.toLocaleString()}
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
            Budget progress updates after you create limits and add transactions.
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
