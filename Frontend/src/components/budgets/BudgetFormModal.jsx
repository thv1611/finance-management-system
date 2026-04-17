import { useState } from "react";

function formatAmountInput(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function getInitialFormValues(initialValues) {
  return {
    category_id: initialValues?.category_id ? String(initialValues.category_id) : "",
    month: initialValues?.month ? String(initialValues.month) : "",
    year: initialValues?.year ? String(initialValues.year) : "",
    amount_limit: formatAmountInput(initialValues?.amount_limit),
  };
}

export default function BudgetFormModal({
  isOpen,
  mode = "create",
  categories = [],
  initialValues,
  isSubmitting = false,
  submitError = "",
  onClose,
  onSubmit,
}) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(initialValues));
  const [errors, setErrors] = useState({});

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.category_id) {
      nextErrors.category_id = "Category is required.";
    }

    if (!formValues.month) {
      nextErrors.month = "Month is required.";
    }

    if (!formValues.year) {
      nextErrors.year = "Year is required.";
    }

    if (!formValues.amount_limit || Number(formValues.amount_limit) <= 0) {
      nextErrors.amount_limit = "Budget limit must be greater than 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit?.({
      category_id: Number(formValues.category_id),
      month: Number(formValues.month),
      year: Number(formValues.year),
      amount_limit: Number(formValues.amount_limit),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2d38]/30 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[24px] bg-white p-6 shadow-[0_32px_70px_rgba(35,66,85,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#13977f]">
              {mode === "edit" ? "Update Budget" : "New Budget"}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#25313b]">
              {mode === "edit" ? "Edit your budget limit" : "Create a budget limit"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#eef2f5] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#60707c] transition hover:bg-[#e3eaef]"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8b98a5]">
              Category
            </span>
            <select
              value={formValues.category_id}
              onChange={(event) => updateField("category_id", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d7e2e6] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f]"
            >
              <option value="">Select an expense category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id ? (
              <p className="mt-2 text-xs font-bold text-[#dd4d58]">{errors.category_id}</p>
            ) : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8b98a5]">
                Month
              </span>
              <select
                value={formValues.month}
                onChange={(event) => updateField("month", event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d7e2e6] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f]"
              >
                <option value="">Select month</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              {errors.month ? <p className="mt-2 text-xs font-bold text-[#dd4d58]">{errors.month}</p> : null}
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8b98a5]">
                Year
              </span>
              <input
                type="number"
                min="2000"
                value={formValues.year}
                onChange={(event) => updateField("year", event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d7e2e6] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f]"
                placeholder="2026"
              />
              {errors.year ? <p className="mt-2 text-xs font-bold text-[#dd4d58]">{errors.year}</p> : null}
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#8b98a5]">
              Budget Limit
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formValues.amount_limit}
              onChange={(event) => updateField("amount_limit", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d7e2e6] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition focus:border-[#13977f]"
              placeholder="0.00"
            />
            {errors.amount_limit ? (
              <p className="mt-2 text-xs font-bold text-[#dd4d58]">{errors.amount_limit}</p>
            ) : null}
          </label>

          {submitError ? (
            <div className="rounded-xl bg-[#fff0f1] px-4 py-3 text-sm font-semibold text-[#cf3f4c]">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#eef2f5] px-5 py-3 text-sm font-black text-[#60707c] transition hover:bg-[#e3eaef]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
