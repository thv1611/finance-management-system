import { Icon } from "../dashboard/DashboardIcons";

import { formatCurrency } from "../../lib/financeData";

export default function TransactionSummaryPanel({ transaction }) {
  const details = [
    ["Created", transaction?.createdAt || transaction?.dateTime || transaction?.date || "-"],
    ["Original Amount", formatCurrency(transaction?.originalAmount ?? transaction?.amount ?? 0)],
    ["Initial Source", transaction?.source || "Imported"],
  ];

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_22px_50px_rgba(35,66,85,0.065)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d99a5]">Original Summary</p>
      <div className="mt-5 space-y-4">
        {details.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-[#edf2f5] pb-4 last:border-b-0 last:pb-0">
            <span className="text-sm font-bold text-[#8a97a4]">{label}</span>
            <span className="text-right text-sm font-black text-[#25313b]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-[#f5f8fa] p-4">
        <Icon name="receipt" className="mb-3 h-5 w-5 text-[#13977f]" />
        <p className="text-sm font-semibold leading-6 text-[#687684]">
          Changes to this transaction will update connected budgets, reports, and cash-flow trends.
        </p>
      </div>
    </section>
  );
}
