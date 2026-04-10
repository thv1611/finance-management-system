import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function CashFlowChartCard({ data = [] }) {
  const hasData = data.length > 0;
  const total = data.reduce((sum, item) => sum + Number(item.income || 0) - Number(item.expenses || 0), 0);

  return (
    <section className="mt-6 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9aa6b2]">
            Total Projected Cash Flow
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-4xl font-black tracking-[-0.05em] text-[#1f2d38]">{formatCurrency(total)}</p>
            <span className="rounded-full bg-[#e7f7f0] px-3 py-1 text-xs font-black text-[#129477]">
              {hasData ? "Live" : "0%"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-black text-[#6b7884]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#93decf]" />
            Income
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5f78c8]" />
            Expenses
          </span>
        </div>
      </div>

      <div className="mt-8 h-[350px] rounded-lg bg-gradient-to-b from-white to-[#fbfdfe] px-4 pb-5 pt-2">
        {hasData ? (
          <div className="flex h-[292px] items-end justify-between gap-4">
            {data.map(({ date, income, expenses }) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-4">
                <div className="flex h-[250px] items-end gap-3">
                  <div
                    className="w-12 rounded-t-lg bg-gradient-to-b from-[#8edcca] to-[#dff6f1] shadow-[0_10px_26px_rgba(46,168,141,0.16)] transition hover:opacity-85 md:w-14"
                    style={{ height: `${Math.min(Number(income || 0), 240)}px` }}
                  />
                  <div
                    className="w-12 rounded-t-lg bg-gradient-to-b from-[#647bc5] to-[#e3e8fb] shadow-[0_10px_26px_rgba(91,112,189,0.13)] transition hover:opacity-85 md:w-14"
                    style={{ height: `${Math.min(Number(expenses || 0), 240)}px` }}
                  />
                </div>
                <span className="text-xs font-black text-[#a0abb5]">{date}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState className="h-full" title="No data available" message="Cash flow trends appear after transactions are recorded." />
        )}
      </div>
    </section>
  );
}
