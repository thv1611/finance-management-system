const ranges = ["Weekly", "Monthly", "Yearly"];
const metrics = ["Income", "Expenses", "Difference"];

function SegmentedControl({ items, active }) {
  return (
    <div className="flex w-fit rounded-lg bg-white p-1.5 shadow-[0_14px_35px_rgba(35,66,85,0.05)]">
      {items.map((item) => (
        <button
          key={item}
          className={`rounded-md px-5 py-2.5 text-sm font-black transition ${
            item === active
              ? "bg-[#13977f] text-white shadow-[0_10px_22px_rgba(19,151,127,0.2)]"
              : "text-[#8b98a5] hover:bg-[#f2f7f8] hover:text-[#293743]"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default function CashFlowFilters() {
  return (
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <SegmentedControl items={ranges} active="Weekly" />
      <SegmentedControl items={metrics} active="Income" />
    </div>
  );
}
