import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function RecentTransactions({ transactions = [] }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Recent Transactions</h2>
          <p className="mt-1 text-sm font-semibold text-[#8e9aa6]">A quick read on your latest money movement.</p>
        </div>
        <Link to="/transactions" className="text-sm font-bold text-[#12987f] transition hover:text-[#0b6f63]">
          View all
        </Link>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 rounded-2xl border border-[#edf2f5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfe_100%)] p-3 transition hover:-translate-y-0.5 hover:border-[#d8e7ea] hover:shadow-[0_18px_34px_rgba(35,66,85,0.06)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef3f5] text-[#5c6b78]">
                <Icon name={transaction.icon || "card"} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#283641]">{transaction.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#9aa6b2]">
                  <span>{transaction.category}</span>
                  <span className="h-1 w-1 rounded-full bg-[#c7d3db]" />
                  <span>{transaction.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-black ${
                    transaction.type === "income" ? "text-[#119b72]" : "text-[#1f2d38]"
                  }`}
                >
                  {formatCurrency(transaction.amount, { sign: transaction.type === "income" ? "+" : "-" })}
                </p>
                <p className="mt-1 text-xs font-bold text-[#12a27d]">{transaction.status || "Completed"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transactions yet"
          message="Add your first transaction to see recent activity."
          actionLabel="+ Add Transaction"
          onAction={() => {
            window.location.href = "/transactions/new";
          }}
        />
      )}
    </section>
  );
}
