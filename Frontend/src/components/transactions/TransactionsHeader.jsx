import { Link } from "react-router-dom";
import { Icon } from "../dashboard/DashboardIcons";
import UserMenu from "../dashboard/UserMenu";

export default function TransactionsHeader({ user }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg bg-white/76 px-5 py-4 shadow-[0_18px_42px_rgba(35,66,85,0.045)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-[420px]">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa7b2]" />
        <input
          type="search"
          placeholder="Search transactions..."
          className="h-12 w-full rounded-lg border border-transparent bg-[#f7fafb] pl-11 pr-4 text-sm font-semibold text-[#25323d] outline-none transition placeholder:text-[#a5afb8] focus:border-[#93d9cf] focus:bg-white"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button className="grid h-12 w-12 place-items-center rounded-lg bg-[#f7fafb] text-[#667684] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
          <Icon name="bell" className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>
        <Link
          to="/transactions/new"
          className="rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]"
        >
          + Add Transaction
        </Link>
        <UserMenu user={user} size="sm" showUserSummary />
      </div>
    </header>
  );
}
