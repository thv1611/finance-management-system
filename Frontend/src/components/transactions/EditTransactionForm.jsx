import { useMemo, useState } from "react";
import AuthMessage from "../auth/AuthMessage";
import FormField from "./FormField";
import ReceiptPreviewCard from "./ReceiptPreviewCard";
import ReceiptUploadBox from "./ReceiptUploadBox";
import { SelectInput, TextInput } from "./TransactionInput";
import TransactionTypeToggle from "./TransactionTypeToggle";

function normalizeAmountInput(value) {
  if (!value) {
    return "";
  }

  return Number(value).toLocaleString("vi-VN");
}

function getInitialFormState(transaction) {
  return {
    title: transaction?.title || "",
    amount: transaction ? String(Math.trunc(Number(transaction.amount || 0))) : "",
    type: transaction?.type || "expense",
    category_id: transaction?.category_id ? String(transaction.category_id) : "",
    transaction_date: transaction?.transaction_date || "",
    description: transaction?.description || "",
    receiptUrl: transaction?.receiptUrl || transaction?.receipt_url || "",
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected receipt."));
    reader.readAsDataURL(file);
  });
}

export default function EditTransactionForm({
  transaction,
  categories = [],
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(() => getInitialFormState(transaction));
  const [error, setError] = useState("");
  const [receiptData, setReceiptData] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(() => getInitialFormState(transaction).receiptUrl);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [shouldRemoveReceipt, setShouldRemoveReceipt] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAmountChange(event) {
    const digitsOnly = event.target.value.replace(/[^\d]/g, "");
    setForm((prev) => ({
      ...prev,
      amount: digitsOnly,
    }));
  }

  function handleTypeChange(typeLabel) {
    const type = typeLabel.toLowerCase();
    setForm((prev) => ({
      ...prev,
      type,
      category_id: "",
    }));
  }

  async function handleReceiptSelect(file) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Receipt image must be PNG, JPG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Receipt image must be 5MB or smaller.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReceiptData(dataUrl);
      setReceiptPreviewUrl(dataUrl);
      setReceiptFileName(file.name);
      setShouldRemoveReceipt(false);
      setError("");
    } catch (nextError) {
      setError(nextError.message || "Unable to read the selected receipt.");
    }
  }

  function handleRemoveReceipt() {
    setReceiptData("");
    setReceiptPreviewUrl("");
    setReceiptFileName("");
    setShouldRemoveReceipt(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.amount || !form.category_id || !form.transaction_date) {
      setError("Please complete all required transaction fields.");
      return;
    }

    await onSubmit?.({
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category_id: Number(form.category_id),
      transaction_date: form.transaction_date,
      description: form.description.trim(),
      receipt_data: receiptData || undefined,
      remove_receipt: shouldRemoveReceipt,
    });
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
      <form id="edit-transaction-form" onSubmit={handleSubmit} className="space-y-6">
        <AuthMessage tone="error" message={error} />

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <TextInput
              name="title"
              value={form.title}
              onChange={handleChange}
              aria-label="Title"
            />
          </FormField>

          <FormField label="Amount">
            <TextInput
              value={normalizeAmountInput(form.amount)}
              onChange={handleAmountChange}
              aria-label="Amount"
              inputMode="numeric"
            />
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Transaction Type">
            <TransactionTypeToggle
              activeType={form.type === "income" ? "Income" : "Expense"}
              onChange={handleTypeChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Category">
            <SelectInput name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Select a category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Date">
          <input
            type="date"
            name="transaction_date"
            value={form.transaction_date}
            onChange={handleChange}
            aria-label="Transaction date"
            className="h-12 w-full rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 text-sm font-bold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white"
          />
        </FormField>

        <FormField label="Reference Note">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            aria-label="Reference note"
            className="min-h-[110px] w-full resize-none rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a5afb8] focus:border-[#8fd8cd] focus:bg-white"
          />
        </FormField>

        <FormField label="Receipt Image" hint="Optional. Replace or remove the current receipt image.">
          <div className="space-y-4">
            <ReceiptUploadBox
              onFileSelect={handleReceiptSelect}
              disabled={isSubmitting}
              fileName={receiptFileName}
            />
            <ReceiptPreviewCard
              receiptUrl={receiptPreviewUrl}
              onRemove={handleRemoveReceipt}
              isRemoving={isSubmitting}
            />
          </div>
        </FormField>
      </form>
    </section>
  );
}
