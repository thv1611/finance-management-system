import { Link } from "react-router-dom";
import { Icon } from "./DashboardIcons";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function RecentTransactions({ transactions = [] }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Recent Transactions</h2>
        <Link to="/transactions" className="text-sm font-bold text-[#12987f] transition hover:text-[#0b6f63]">
          View all
        </Link>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 rounded-lg p-2 transition hover:bg-[#f7fafb]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef3f5] text-[#5c6b78]">
                <Icon name={transaction.icon || "card"} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#283641]">{transaction.description}</p>
                <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">{transaction.category}</p>
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
        <EmptyState title="No transactions yet" message="Add your first transaction to see recent activity." />
      )}
    </section>
  );
}
