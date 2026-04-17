import { Icon } from "../dashboard/DashboardIcons";

export default function ExportTrendReportCard({
  onExport,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-lg bg-white/80 px-5 py-5 text-left shadow-[0_18px_40px_rgba(35,66,85,0.055)] transition hover:-translate-y-1 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef4fb] text-[#5f78c8]">
        <Icon name="file" className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-[#34424d]">Export Trend Report</p>
        <p className="mt-1 text-xs font-semibold text-[#9aa6b2]">CSV format</p>
      </div>
    </button>
  );
}
