import { Icon } from "./DashboardIcons";
import UserMenu from "./UserMenu";

export default function DashboardHeader({ user }) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 bg-[#eef2f5]/85 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between lg:px-8">
      <div className="relative w-full md:max-w-[430px]">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa7b2]" />
        <input
          type="search"
          placeholder="Search insights..."
          className="h-11 w-full rounded-lg border border-transparent bg-white/82 pl-11 pr-4 text-sm font-medium text-[#25323d] outline-none shadow-[0_10px_30px_rgba(35,66,85,0.05)] transition placeholder:text-[#a5afb8] focus:border-[#93d9cf] focus:bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button className="grid h-11 w-11 place-items-center rounded-lg bg-white/85 text-[#667684] shadow-[0_10px_30px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
          <Icon name="bell" className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>
        <button className="rounded-lg bg-[#14977f] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(20,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#118872]">
          + Add Transaction
        </button>
        <UserMenu user={user} size="sm" />
      </div>
    </header>
  );
}
