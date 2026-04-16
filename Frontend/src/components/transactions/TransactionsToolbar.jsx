import { useState } from "react";
import { Icon } from "../dashboard/DashboardIcons";

const types = [
  ["All", "all"],
  ["Income", "income"],
  ["Expense", "expense"],
];

const datePresets = [
  ["All Time", "all"],
  ["Today", "today"],
  ["This Week", "thisWeek"],
  ["Last 30 Days", "last30Days"],
  ["This Month", "thisMonth"],
  ["Last Month", "lastMonth"],
  ["Custom Range", "customRange"],
];

function SelectButton({ label, onClick, isActive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 items-center justify-between gap-4 rounded-lg bg-white px-4 text-sm font-black shadow-[0_12px_28px_rgba(35,66,85,0.05)] transition hover:-translate-y-0.5 ${
        isActive ? "text-[#0f8e7e]" : "text-[#52616d]"
      }`}
    >
      {label}
      <span className="text-[#9aa6b2]">v</span>
    </button>
  );
}

export default function TransactionsToolbar({
  activeType = "all",
  activeDatePreset = "last30Days",
  customStartDate = "",
  customEndDate = "",
  categories = [],
  selectedCategoryIds = [],
  onTypeChange,
  onDatePresetChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onClearDateFilter,
  onToggleCategory,
  onClearCategories,
}) {
  const [openPanel, setOpenPanel] = useState("");
  const selectedCategoryCount = selectedCategoryIds.length;
  const dateLabel = datePresets.find(([, value]) => value === activeDatePreset)?.[0] || "All Time";
  const categoryLabel = selectedCategoryCount > 0 ? `${selectedCategoryCount} Categories` : "All Categories";

  function togglePanel(panelName) {
    setOpenPanel((prev) => (prev === panelName ? "" : panelName));
  }

  return (
    <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex w-fit rounded-lg bg-white p-1.5 shadow-[0_14px_35px_rgba(35,66,85,0.05)]">
        {types.map(([label, value]) => (
          <button
            key={value}
            type="button"
            onClick={() => onTypeChange?.(value)}
            className={`rounded-md px-5 py-2.5 text-sm font-black transition ${
              activeType === value
                ? "bg-[#13977f] text-white shadow-[0_10px_22px_rgba(19,151,127,0.2)]"
                : "text-[#8b98a5] hover:bg-[#f2f7f8] hover:text-[#293743]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <SelectButton
            label={dateLabel}
            onClick={() => togglePanel("date")}
            isActive={activeDatePreset !== "last30Days"}
          />
          {openPanel === "date" ? (
            <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-64 rounded-lg border border-[#e4ecef] bg-white p-3 shadow-[0_18px_42px_rgba(35,66,85,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-[#25313b]">Date Range</p>
                <button
                  type="button"
                  onClick={onClearDateFilter}
                  className="text-xs font-black text-[#13977f] transition hover:text-[#0f8e7e]"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {datePresets.map(([label, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onDatePresetChange?.(value)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-black transition ${
                      activeDatePreset === value
                        ? "bg-[#e7f7f0] text-[#0f8e7e]"
                        : "text-[#53616d] hover:bg-[#f5f8fa]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeDatePreset === "customRange" ? (
                <div className="mt-3 grid gap-3 border-t border-[#edf2f5] pt-3">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(event) => onCustomStartDateChange?.(event.target.value)}
                    className="h-10 rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(event) => onCustomEndDateChange?.(event.target.value)}
                    className="h-10 rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <SelectButton
            label={categoryLabel}
            onClick={() => togglePanel("category")}
            isActive={selectedCategoryCount > 0}
          />
          {openPanel === "category" ? (
            <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-72 rounded-lg border border-[#e4ecef] bg-white p-3 shadow-[0_18px_42px_rgba(35,66,85,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-[#25313b]">Categories</p>
                <button
                  type="button"
                  onClick={onClearCategories}
                  className="text-xs font-black text-[#13977f] transition hover:text-[#0f8e7e]"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id);

                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#52616d] transition hover:bg-[#f5f8fa]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleCategory?.(category.id)}
                        className="h-4 w-4 rounded border-[#cbd5dc] text-[#13977f] focus:ring-[#8fd8cd]"
                      />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#9aa6b2]">
                        {category.type}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

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
