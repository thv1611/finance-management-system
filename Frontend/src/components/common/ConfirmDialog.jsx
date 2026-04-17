export default function ConfirmDialog({
  isOpen,
  title = "Confirm action",
  description = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClassName =
    tone === "danger"
      ? "bg-[#dd4d58] text-white shadow-[0_16px_34px_rgba(221,77,88,0.24)] hover:bg-[#c53e49]"
      : "bg-[#13977f] text-white shadow-[0_16px_34px_rgba(19,151,127,0.24)] hover:bg-[#0e806f]";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1f2d38]/34 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-[0_32px_70px_rgba(35,66,85,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#13977f]">Confirmation</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#25313b]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-lg bg-[#eef2f5] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#60707c] transition hover:bg-[#e3eaef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        {description ? (
          <p className="mt-4 text-sm font-semibold leading-7 text-[#6f7c88]">{description}</p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-lg bg-[#eef2f5] px-5 py-3 text-sm font-black text-[#60707c] transition hover:bg-[#e3eaef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded-lg px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${confirmButtonClassName}`}
          >
            {isConfirming ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
