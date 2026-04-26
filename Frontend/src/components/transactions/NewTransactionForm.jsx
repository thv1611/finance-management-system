import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthMessage from "../auth/AuthMessage";
import { Icon } from "../dashboard/DashboardIcons";
import {
  createTransaction,
  getCategories,
  parseTransactionQuickEntry,
  parseTransactionReceipt,
} from "../../lib/transactionsApi";
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
  const [isAnalyzingReceipt, setIsAnalyzingReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState("");
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptInsight, setReceiptInsight] = useState(null);
  const [quickEntryText, setQuickEntryText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsingQuickEntry, setIsParsingQuickEntry] = useState(false);
  const recognitionRef = useRef(null);

  const voiceRecognitionSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  useEffect(() => {
    const draft = location.state?.transactionDraft;
    const quickEntry = location.state?.quickEntryText;

    if (quickEntry) {
      setQuickEntryText(String(quickEntry));
    }

    if (draft) {
      applyDraftToForm(draft);
      setReceiptInsight(draft);
      setTone("neutral");
      setMessage("Draft loaded from Quick Add. Review it and save when ready.");
    }
  }, [location.state]);

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

  function applyDraftToForm(result) {
    const draft = result?.draft;

    if (!draft) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      type: draft.type || prev.type,
      amount: draft.amount ? String(Math.round(Number(draft.amount))) : prev.amount,
      title: draft.title || prev.title,
      description: draft.description || prev.description,
      transaction_date: draft.transaction_date || prev.transaction_date,
      category_id: draft.category_id ? String(draft.category_id) : prev.category_id,
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
      setReceiptInsight(null);
      setTone("neutral");
      setMessage("Analyzing receipt with AI...");
      setIsAnalyzingReceipt(true);

      const result = await parseTransactionReceipt({
        receipt_data: dataUrl,
      });
      applyDraftToForm(result.data);

      setReceiptInsight(result.data || null);
      setTone("neutral");
      setMessage("Receipt scanned. Please review the suggested transaction before saving.");
    } catch (error) {
      setTone("error");
      setMessage(
        error.response?.message ||
          error.message ||
          "Unable to analyze the selected receipt."
      );
    } finally {
      setIsAnalyzingReceipt(false);
    }
  }

  async function handleParseQuickEntry(inputText = quickEntryText) {
    const trimmedText = String(inputText || "").trim();

    if (!trimmedText) {
      setTone("error");
      setMessage("Add a short voice or text note before asking AI to parse it.");
      return;
    }

    try {
      setIsParsingQuickEntry(true);
      setTone("neutral");
      setMessage("Parsing your quick entry with AI...");
      const result = await parseTransactionQuickEntry({
        entry_text: trimmedText,
      });

      applyDraftToForm(result.data);
      setReceiptInsight(result.data || null);
      setTone("neutral");
      setMessage("Quick entry parsed. Review the draft and save when ready.");
    } catch (error) {
      setTone("error");
      setMessage(
        error.response?.message ||
          error.message ||
          "Unable to parse the quick entry right now."
      );
    } finally {
      setIsParsingQuickEntry(false);
    }
  }

  function handleStartVoiceCapture() {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setTone("error");
      setMessage("Voice capture is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTone("neutral");
      setMessage("Listening... Describe the transaction naturally.");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setQuickEntryText(transcript);
        handleParseQuickEntry(transcript);
      }
    };

    recognition.onerror = () => {
      setTone("error");
      setMessage("Voice capture failed. You can still type a quick note below.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleRemoveReceipt() {
    setReceiptData("");
    setReceiptPreviewUrl("");
    setReceiptFileName("");
    setReceiptInsight(null);
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

        <section className="rounded-2xl border border-[#dde8eb] bg-[linear-gradient(135deg,#f8fbfc_0%,#f3fbf8_55%,#ffffff_100%)] p-5 shadow-[0_18px_40px_rgba(35,66,85,0.045)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#0d9488] shadow-[0_10px_24px_rgba(19,151,127,0.1)]">
                Smart Capture
              </div>
              <h2 className="mt-3 text-xl font-black tracking-[-0.03em] text-[#25313b]">
                Add a transaction by voice or one quick sentence.
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#73818d]">
                Say something like “Ăn trưa 75 nghìn hôm nay” or “Nhận lương 12 triệu” and the app will turn it into a structured draft for you.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartVoiceCapture}
              disabled={!voiceRecognitionSupported || isSubmitting || isAnalyzingReceipt || isParsingQuickEntry}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition ${
                isListening
                  ? "bg-[#d6465f] text-white shadow-[0_16px_34px_rgba(214,70,95,0.24)]"
                  : "bg-[#0d9488] text-white shadow-[0_16px_34px_rgba(13,148,136,0.2)] hover:-translate-y-0.5"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Icon name="microphone" className="h-4 w-4" />
              {isListening ? "Stop Listening" : "Voice Entry"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <textarea
              value={quickEntryText}
              onChange={(event) => setQuickEntryText(event.target.value)}
              placeholder="Example: Hôm nay đổ xăng 120 nghìn, hoặc Nhận lương tháng này 12 triệu..."
              className="min-h-[104px] w-full resize-none rounded-lg border border-[#e6edf1] bg-white px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a5afb8] focus:border-[#8fd8cd] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleParseQuickEntry()}
              disabled={isSubmitting || isAnalyzingReceipt || isParsingQuickEntry || !quickEntryText.trim()}
              className="h-fit rounded-full bg-[#1f2d38] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(31,45,56,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isParsingQuickEntry ? "Parsing..." : "Use AI Note"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[#82909c]">
            <span className="rounded-full bg-white px-3 py-1.5 shadow-[0_8px_20px_rgba(35,66,85,0.04)]">
              Voice support: {voiceRecognitionSupported ? "available" : "browser limited"}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 shadow-[0_8px_20px_rgba(35,66,85,0.04)]">
              Best for simple entries like food, transport, salary, bonus
            </span>
          </div>
        </section>

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
              disabled={isSubmitting || isAnalyzingReceipt}
              fileName={receiptFileName}
            />
            <ReceiptPreviewCard
              receiptUrl={receiptPreviewUrl}
              onRemove={handleRemoveReceipt}
              isRemoving={isSubmitting || isAnalyzingReceipt}
            />
            {isAnalyzingReceipt ? (
              <div className="rounded-lg border border-[#dce9e6] bg-[#f4fbf8] px-4 py-3 text-sm font-semibold text-[#0b7d6d]">
                AI is reading the receipt and preparing a transaction draft...
              </div>
            ) : null}
            {receiptInsight?.draft ? (
              <section className="rounded-lg border border-[#e4edf1] bg-[#fbfdfe] p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e7f7f0] text-[#13977f]">
                    <Icon name="ai" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#25313b]">AI Receipt Draft</p>
                    <p className="text-xs font-semibold text-[#8d99a5]">
                      Autofilled from the uploaded bill. You can edit anything before saving.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-white px-4 py-3 shadow-[0_12px_28px_rgba(35,66,85,0.04)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#97a3ae]">Merchant</p>
                    <p className="mt-1 text-sm font-black text-[#25313b]">
                      {receiptInsight.draft.merchant || "Not clearly detected"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-4 py-3 shadow-[0_12px_28px_rgba(35,66,85,0.04)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#97a3ae]">Suggested Category</p>
                    <p className="mt-1 text-sm font-black text-[#25313b]">
                      {receiptInsight.draft.category_name ||
                        receiptInsight.draft.suggested_category ||
                        "Needs manual selection"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[#73828e]">
                  <span className="rounded-full bg-[#eef5f7] px-3 py-1.5">
                    Confidence: {Math.round(Number(receiptInsight.draft.confidence || 0) * 100)}%
                  </span>
                  <span className="rounded-full bg-[#eef5f7] px-3 py-1.5">
                    Provider: {receiptInsight.meta?.providerLabel || "AI"}
                  </span>
                  <span className="rounded-full bg-[#eef5f7] px-3 py-1.5">
                    Type: {receiptInsight.draft.type}
                  </span>
                </div>

                {receiptInsight.draft.notes ? (
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#62707b]">
                    {receiptInsight.draft.notes}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        </FormField>

        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCategories || isAnalyzingReceipt}
            className="h-12 w-full max-w-[310px] rounded-full bg-gradient-to-r from-[#087d6f] to-[#78dcc7] text-sm font-black text-white shadow-[0_18px_38px_rgba(15,143,131,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </section>
  );
}
