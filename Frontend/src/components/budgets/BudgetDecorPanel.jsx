import { formatCurrency } from "../../lib/financeData";

export default function BudgetDecorPanel({ remaining = 0 }) {
  return (
    <section className="min-h-[150px] overflow-hidden rounded-lg bg-gradient-to-br from-[#e7f3f1] via-[#edf6f6] to-[#f4f7fb] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
      <div className="flex h-full items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8b98a5]">Monthly Cushion</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#1f2d38]">
            {formatCurrency(remaining)}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#71808c]">Available before your next reset.</p>
        </div>
        <div className="hidden h-24 w-40 rounded-lg bg-white/55 shadow-[0_20px_45px_rgba(35,66,85,0.04)] md:block" />
      </div>
    </section>
  );
}
