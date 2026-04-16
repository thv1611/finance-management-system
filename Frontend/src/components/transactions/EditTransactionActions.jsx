import { Icon } from "../dashboard/DashboardIcons";

export default function EditTransactionActions({
  onDelete,
  onCancel,
  isDeleting = false,
  isSubmitting = false,
  formId,
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg bg-white/70 p-4 shadow-[0_18px_40px_rgba(35,66,85,0.045)] sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-2 text-sm font-black text-[#dd4d58] transition hover:text-[#b52f3a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="trash" className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Transaction"}
      </button>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#dfe7eb] bg-white px-5 py-3 text-sm font-black text-[#53616d] transition hover:-translate-y-0.5 hover:bg-[#f7fafb]"
        >
          Cancel
        </button>
        <button
          type="submit"
          form={formId}
          disabled={isSubmitting}
          className="rounded-lg bg-gradient-to-r from-[#0f8f83] to-[#38c5aa] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,143,131,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating..." : "Update Transaction"}
        </button>
      </div>
    </div>
  );
}
