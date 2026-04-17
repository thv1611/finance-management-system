export default function ReceiptPreviewCard({ receiptUrl, onRemove, isRemoving = false }) {
  if (!receiptUrl) {
    return null;
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_18px_40px_rgba(35,66,85,0.055)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8d99a5]">Receipt Preview</p>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-xs font-black uppercase tracking-[0.08em] text-[#d05f5f] transition hover:text-[#b74a4a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg bg-[#f8fbfc] p-4">
        <img src={receiptUrl} alt="Receipt preview" className="mx-auto max-h-[240px] rounded-lg object-contain" />
      </div>
    </section>
  );
}
