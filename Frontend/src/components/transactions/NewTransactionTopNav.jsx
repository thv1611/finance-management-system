import { Icon } from "../dashboard/DashboardIcons";
import UserMenu from "../dashboard/UserMenu";

const navItems = ["Overview", "Activity", "Wallets"];

export default function NewTransactionTopNav({ user }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg bg-white/72 px-5 py-4 shadow-[0_18px_42px_rgba(35,66,85,0.045)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-6">
        <div className="text-2xl font-black tracking-[-0.08em]">
          <span className="text-[#0aa7a4]">S</span>
          <span className="text-[#2c8dec]">Y</span>
          <span className="text-[#15c38f]">M</span>
        </div>
        <nav className="flex items-center gap-5">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-black text-[#7d8a96] transition hover:text-[#13977f]"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[280px]">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa7b2]" />
          <input
            type="search"
            placeholder="Search data..."
            className="h-11 w-full rounded-lg border border-transparent bg-[#f7fafb] pl-11 pr-4 text-sm font-semibold text-[#25323d] outline-none transition placeholder:text-[#a5afb8] focus:border-[#93d9cf] focus:bg-white"
          />
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-lg bg-[#f7fafb] text-[#667684] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
          <Icon name="bell" className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>
        <UserMenu user={user} size="sm" />
      </div>
    </header>
  );
}
