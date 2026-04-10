const ranges = ["Week", "Month", "Year"];

function SelectPill({ label }) {
  return (
    <button className="flex h-11 items-center justify-between gap-4 rounded-lg bg-white px-4 text-sm font-bold text-[#52616d] shadow-[0_14px_35px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 hover:text-[#0f8e7e]">
      {label}
      <span className="text-[#9aa6b2]">v</span>
    </button>
  );
}

export default function ReportsFilters() {
  return (
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-fit rounded-lg bg-white p-1.5 shadow-[0_14px_35px_rgba(35,66,85,0.05)]">
        {ranges.map((range) => (
          <button
            key={range}
            className={`rounded-md px-6 py-2.5 text-sm font-black transition ${
              range === "Week"
                ? "bg-[#13977f] text-white shadow-[0_10px_22px_rgba(19,151,127,0.2)]"
                : "text-[#8b98a5] hover:bg-[#f2f7f8] hover:text-[#293743]"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <SelectPill label="All Categories" />
        <SelectPill label="All Accounts" />
      </div>
    </div>
  );
}
