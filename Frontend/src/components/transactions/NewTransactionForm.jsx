import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthMessage from "../auth/AuthMessage";
import { Icon } from "../dashboard/DashboardIcons";
import { createTransaction, getCategories } from "../../lib/transactionsApi";
import FormField from "./FormField";
import ReceiptPreviewCard from "./ReceiptPreviewCard";
import ReceiptUploadBox from "./ReceiptUploadBox";
import { SelectInput } from "./TransactionInput";

function TypeToggle({ value, onChange, disabled }) {
  return (
    <div className="mx-auto mt-6 grid max-w-[320px] grid-cols-2 rounded-lg bg-[#eff4f6] p-1.5">
      {[
        ["Expense", "expense"],
        ["Income", "income"],
      ].map(([label, type]) => {
        const active = type === value;

        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            className={`rounded-md px-4 py-3 text-sm font-black transition ${
              active
                ? "bg-[#26333e] text-white shadow-[0_12px_26px_rgba(38,51,62,0.16)]"
                : "text-[#7d8a96] hover:bg-white/75 hover:text-[#26333e]"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PlainInput({ value, className = "", ...props }) {
  return (
    <input
      value={value}
      className={`h-12 w-full rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 text-sm font-bold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white ${className}`}
      {...props}
    />
  );
}

function formatAmountInput(value) {
  if (!value) {
    return "";
  }

  return Number(value).toLocaleString("vi-VN");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected receipt."));
    reader.readAsDataURL(file);
  });
}

export default function NewTransactionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category_id: "",
    title: "",
    description: "",
    transaction_date: new Date().toISOString().slice(0, 10),
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [receiptFileName, setReceiptFileName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const result = await getCategories();
        if (!isMounted) {
          return;
        }
        setCategories(result.data || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setTone("error");
        setMessage(error.response?.message || error.message || "Unable to load categories.");
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  useEffect(() => {
    if (!filteredCategories.some((category) => String(category.id) === form.category_id)) {
      setForm((prev) => ({
        ...prev,
        category_id: "",
      }));
    }
  }, [filteredCategories, form.category_id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function handleAmountChange(event) {
    const digitsOnly = event.target.value.replace(/[^\d]/g, "");

    setForm((prev) => ({
      ...prev,
      amount: digitsOnly,
    }));

    if (errors.amount) {
      setErrors((prev) => ({
        ...prev,
        amount: "",
      }));
    }
  }

  function handleTypeChange(type) {
    setForm((prev) => ({
      ...prev,
      type,
      category_id: "",
    }));
    setErrors((prev) => ({
      ...prev,
      type: "",
      category_id: "",
    }));
  }

  async function handleReceiptSelect(file) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setTone("error");
      setMessage("Receipt image must be PNG, JPG, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setTone("error");
      setMessage("Receipt image must be 5MB or smaller.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReceiptData(dataUrl);
      setReceiptPreviewUrl(dataUrl);
      setReceiptFileName(file.name);
      setTone("neutral");
      setMessage("");
    } catch (error) {
      setTone("error");
      setMessage(error.message || "Unable to read the selected receipt.");
    }
  }

  function handleRemoveReceipt() {
    setReceiptData("");
    setReceiptPreviewUrl("");
    setReceiptFileName("");
  }

  function validateForm() {
    const nextErrors = {};
    const numericAmount = Number(form.amount);

    if (!form.type) {
      nextErrors.type = "Please select a transaction type.";
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "Amount must be greater than 0.";
    }

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.category_id) {
      nextErrors.category_id = "Please choose a category.";
    }

    if (!form.transaction_date) {
      nextErrors.transaction_date = "Transaction date is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      setTone("error");
      setMessage("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createTransaction({
        type: form.type,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
        title: form.title.trim(),
        description: form.description.trim(),
        transaction_date: form.transaction_date,
        receipt_data: receiptData || undefined,
      });

      setTone("neutral");
      setMessage("Transaction saved successfully.");

      setForm({
        type: "expense",
        amount: "",
        category_id: "",
        title: "",
        description: "",
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      setErrors({});
      handleRemoveReceipt();

      window.setTimeout(() => {
        navigate(`/transactions${location.search}`);
      }, 700);
    } catch (error) {
      const fieldMessage = error.response?.errors?.[0]?.msg;
      setTone("error");
      setMessage(error.response?.message || fieldMessage || error.message || "Unable to save the transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-[760px] rounded-lg bg-white p-6 shadow-[0_28px_70px_rgba(35,66,85,0.075)] md:p-8">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38]">New Transaction</h1>
        <p className="mt-2 text-sm font-semibold text-[#7a8794]">
          Add a new record to your digital sanctuary
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <AuthMessage tone={tone} message={message} />

        <div className="rounded-lg bg-[#f6fafb] px-5 py-7 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#9aa6b2]">Transaction Amount</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-[#6f7c88]">₫</span>
            <input
              name="amount"
              type="text"
              inputMode="numeric"
              value={formatAmountInput(form.amount)}
              onChange={handleAmountChange}
              placeholder="0"
              aria-label="Transaction amount"
              className="w-[180px] bg-transparent text-center text-6xl font-black tracking-[-0.07em] text-[#1f2d38] outline-none"
            />
          </div>
          {errors.amount ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.amount}</p> : null}
          <TypeToggle value={form.type} onChange={handleTypeChange} disabled={isSubmitting} />
          {errors.type ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.type}</p> : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Title" hint={errors.title || "A short label for this transaction"}>
            <PlainInput
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Lunch with friends"
              aria-label="Title"
            />
          </FormField>
          <FormField label="Category" hint={errors.category_id || "Pick a category that matches the transaction type"}>
            <SelectInput
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              disabled={isLoadingCategories || isSubmitting}
            >
              <option value="">
                {isLoadingCategories ? "Loading categories..." : "Select a category"}
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Date" hint={errors.transaction_date || undefined}>
          <PlainInput
            name="transaction_date"
            type="date"
            value={form.transaction_date}
            onChange={handleChange}
            aria-label="Date"
          />
        </FormField>

        <FormField label="Note">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add some context to this flow..."
            className="min-h-[110px] w-full resize-none rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a5afb8] focus:border-[#8fd8cd] focus:bg-white"
          />
        </FormField>

        <FormField label="Receipt Image" hint="Optional. Upload a receipt to keep a visual reference.">
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

        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCategories}
            className="h-12 w-full max-w-[310px] rounded-full bg-gradient-to-r from-[#087d6f] to-[#78dcc7] text-sm font-black text-white shadow-[0_18px_38px_rgba(15,143,131,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </section>
  );
}
