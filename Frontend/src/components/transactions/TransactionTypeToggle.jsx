export default function TransactionTypeToggle({ activeType = "Expense" }) {
  return (
    <div className="grid grid-cols-2 rounded-lg bg-[#f0f5f7] p-1.5">
      {["Income", "Expense"].map((type) => {
        const active = type === activeType;

        return (
          <button
            key={type}
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black transition ${
              active
                ? "bg-[#fff0f1] text-[#d94a56] shadow-[0_10px_22px_rgba(217,74,86,0.12)]"
                : "text-[#82909b] hover:bg-white/70 hover:text-[#25313b]"
            }`}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
