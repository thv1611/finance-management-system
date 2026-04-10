import { Icon } from "../dashboard/DashboardIcons";

export default function CashFlowHeader() {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
          Cash Flow Trends
        </h1>
        <p className="mt-2 text-base font-semibold text-[#7a8794]">
          Analyze your income, expenses, and balance patterns
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa7b2]" />
          <input
            type="search"
            placeholder="Search trends..."
            className="h-12 w-full rounded-lg border border-transparent bg-white/88 pl-11 pr-4 text-sm font-semibold text-[#25323d] outline-none shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition placeholder:text-[#a5afb8] focus:border-[#93d9cf] focus:bg-white"
          />
        </div>
        <button className="rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]">
          Add Transaction
        </button>
        <button className="grid h-12 w-12 place-items-center rounded-lg bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
          <Icon name="bell" className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </button>
      </div>
    </header>
  );
}
