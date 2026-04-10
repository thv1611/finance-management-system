import { Icon } from "../dashboard/DashboardIcons";

const types = ["All", "Income", "Expense"];

function SelectButton({ label }) {
  return (
    <button className="flex h-11 items-center justify-between gap-4 rounded-lg bg-white px-4 text-sm font-black text-[#52616d] shadow-[0_12px_28px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0f8e7e]">
      {label}
      <span className="text-[#9aa6b2]">v</span>
    </button>
  );
}

export default function TransactionsToolbar() {
  return (
    <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex w-fit rounded-lg bg-white p-1.5 shadow-[0_14px_35px_rgba(35,66,85,0.05)]">
        {types.map((type) => (
          <button
            key={type}
            className={`rounded-md px-5 py-2.5 text-sm font-black transition ${
              type === "All"
                ? "bg-[#13977f] text-white shadow-[0_10px_22px_rgba(19,151,127,0.2)]"
                : "text-[#8b98a5] hover:bg-[#f2f7f8] hover:text-[#293743]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <SelectButton label="Last 30 Days" />
        <SelectButton label="All Categories" />
        <button className="grid h-11 w-11 place-items-center rounded-lg bg-white text-[#667684] shadow-[0_12px_28px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
          <Icon name="settings" className="h-5 w-5" />
          <span className="sr-only">Filters</span>
        </button>
        <button className="rounded-lg border border-[#dfe7eb] bg-white px-4 py-3 text-sm font-black text-[#53616d] shadow-[0_12px_28px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0f8e7e]">
          Export CSV
        </button>
      </div>
    </div>
  );
}
