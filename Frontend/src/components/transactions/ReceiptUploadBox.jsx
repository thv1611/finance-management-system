import { Icon } from "../dashboard/DashboardIcons";

export default function ReceiptUploadBox() {
  return (
    <button
      type="button"
      className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#b9d7d4] bg-[#f8fbfc] px-5 py-6 text-center transition hover:border-[#13977f] hover:bg-[#f2faf8]"
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#e7f7f0] text-[#13977f]">
        <Icon name="upload" className="h-5 w-5" />
      </span>
      <span className="mt-4 text-sm font-black text-[#2d3a45]">Click to upload or drag and drop</span>
      <span className="mt-1 text-xs font-semibold text-[#9aa6b2]">PNG, JPG or PDF up to 10MB</span>
    </button>
  );
}
