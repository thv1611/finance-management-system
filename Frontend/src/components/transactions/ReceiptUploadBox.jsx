import { Icon } from "../dashboard/DashboardIcons";

export default function ReceiptUploadBox({
  onFileSelect,
  disabled = false,
  fileName = "",
}) {
  function handleChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect?.(file);
    }

    event.target.value = "";
  }

  return (
    <label className={`block ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <span className="flex min-h-[150px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#b9d7d4] bg-[#f8fbfc] px-5 py-6 text-center transition hover:border-[#13977f] hover:bg-[#f2faf8]">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#e7f7f0] text-[#13977f]">
          <Icon name="upload" className="h-5 w-5" />
        </span>
        <span className="mt-4 text-sm font-black text-[#2d3a45]">
          {fileName ? "Replace receipt image" : "Click to upload a receipt image"}
        </span>
        <span className="mt-1 text-xs font-semibold text-[#9aa6b2]">
          {fileName || "PNG, JPG, or WEBP up to 5MB"}
        </span>
      </span>
    </label>
  );
}
