import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";
import EmptyState from "../common/EmptyState";
import { formatCurrency } from "../../lib/financeData";

export default function TransactionsTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <section className="mt-6 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
        <EmptyState
          title="No transactions yet"
          message="Your transaction history will appear here after you add income or expenses."
          actionLabel="+ Add Transaction"
        />
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg bg-white shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="bg-[#f7fafb] text-xs font-black uppercase tracking-[0.1em] text-[#8d99a5]">
            <tr>
              {["Category", "Description", "Account", "Date", "Amount", "Status", "Actions"].map((head) => (
                <th key={head} className="px-5 py-4">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef3f5]">
            {transactions.map((row) => (
              <tr key={row.id} className="transition hover:bg-[#f8fbfc]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef7fb] text-[#2d8ce9]">
                      <Icon name={row.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-black text-[#34424d]">{row.category}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-bold text-[#25313b]">{row.description || "Untitled transaction"}</td>
                <td className="px-5 py-4 text-sm font-semibold text-[#7b8792]">{row.account || "Unassigned"}</td>
                <td className="px-5 py-4 text-sm font-semibold text-[#7b8792]">{row.date || "-"}</td>
                <td className={`px-5 py-4 text-sm font-black ${row.type === "income" ? "text-[#129477]" : "text-[#dd4d58]"}`}>
                  {formatCurrency(row.amount, { sign: row.type === "income" ? "+" : "-" })}
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${row.status === "Completed" ? "bg-[#e7f7f0] text-[#129477]" : "bg-[#fff6e5] text-[#c58116]"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link to="/transactions/edit" className="text-sm font-black text-[#2d8ce9] transition hover:text-[#0f8e7e]">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#eef3f5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#8d99a5]">Showing 1-{transactions.length} of {transactions.length} transactions</p>
        <div className="flex items-center gap-2">
          {["Prev", "1", "2", "3", "Next"].map((page) => (
            <button
              key={page}
              className={`rounded-lg px-3 py-2 text-sm font-black transition ${
                page === "1"
                  ? "bg-[#13977f] text-white"
                  : "bg-[#f5f8fa] text-[#7b8792] hover:bg-[#e7f7f0] hover:text-[#0f8e7e]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
