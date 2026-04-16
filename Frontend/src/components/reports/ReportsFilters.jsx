const ranges = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

function SelectPill({ value, onChange, options, disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-11 appearance-none rounded-lg bg-white px-4 pr-10 text-sm font-bold text-[#52616d] shadow-[0_14px_35px_rgba(35,66,85,0.05)] outline-none transition hover:-translate-y-0.5 hover:text-[#0f8e7e] disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa6b2]">
        v
      </span>
    </div>
  );
}

export default function ReportsFilters({
  range = "week",
  onRangeChange,
  categoryId = "",
  onCategoryChange,
  categories = [],
}) {
  return (
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-fit rounded-lg bg-white p-1.5 shadow-[0_14px_35px_rgba(35,66,85,0.05)]">
        {ranges.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onRangeChange?.(item.value)}
            className={`rounded-md px-6 py-2.5 text-sm font-black transition ${
              item.value === range
                ? "bg-[#13977f] text-white shadow-[0_10px_22px_rgba(19,151,127,0.2)]"
                : "text-[#8b98a5] hover:bg-[#f2f7f8] hover:text-[#293743]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <SelectPill
          value={categoryId}
          onChange={onCategoryChange}
          options={[
            { label: "All Categories", value: "" },
            ...categories.map((category) => ({
              label: category.name,
              value: String(category.id),
            })),
          ]}
        />
        <SelectPill
          value=""
          disabled
          options={[{ label: "All Accounts", value: "" }]}
        />
      </div>
    </div>
  );
}
