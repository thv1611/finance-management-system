import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Icon } from "./DashboardIcons";
import { parseTransactionQuickEntry } from "../../lib/transactionsApi";

const actions = [
  ["send", "Add Transaction", "/transactions/new"],
  ["file", "Reports", "/reports"],
  ["history", "History", "/transactions"],
  ["support", "Profile", "/profile"],
];

export default function QuickActions() {
  const navigate = useNavigate();
  const [quickEntryText, setQuickEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleQuickAdd() {
    const trimmedText = quickEntryText.trim();

    if (!trimmedText || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      const result = await parseTransactionQuickEntry({
        entry_text: trimmedText,
      });

      navigate("/transactions/new", {
        state: {
          quickEntryText: trimmedText,
          transactionDraft: result.data,
        },
      });
    } catch (error) {
      setMessage(error.response?.message || error.message || "Unable to prepare a quick draft.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Quick Actions</h2>
      <p className="mt-1 text-sm font-semibold text-[#8e9aa6]">Jump straight into the next thing you want to manage.</p>

      <div className="mt-5 rounded-2xl border border-[#e3ecef] bg-[linear-gradient(180deg,#f9fbfc_0%,#f2f8fa_100%)] p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0f8e7e] shadow-[0_10px_24px_rgba(35,66,85,0.06)]">
            <Icon name="ai" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-[#25313b]">Quick Add</p>
            <p className="text-xs font-semibold text-[#8d99a5]">Type one short note like “coffee 45k”</p>
          </div>
        </div>

        <textarea
          value={quickEntryText}
          onChange={(event) => setQuickEntryText(event.target.value)}
          placeholder="Ex: an trua 75k hom nay"
          className="mt-4 min-h-[96px] w-full resize-none rounded-2xl border border-[#e1eaee] bg-white px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a0adb8] focus:border-[#8fd8cd]"
        />

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isSubmitting || !quickEntryText.trim()}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f2d38] px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(31,45,56,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="send" className="h-4 w-4" />
          {isSubmitting ? "Preparing draft..." : "Create Draft"}
        </button>

        {message ? (
          <p className="mt-3 text-xs font-bold text-[#c55353]">{message}</p>
        ) : (
          <p className="mt-3 text-xs font-bold text-[#8d99a5]">
            AI will turn your note into a transaction draft and open the full form.
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map(([icon, label, to]) => (
          <Link
            key={label}
            to={to}
            className="group flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[#edf2f5] bg-[linear-gradient(180deg,#f9fbfc_0%,#f2f7f9_100%)] text-sm font-bold text-[#4d5b66] transition hover:-translate-y-1 hover:border-[#cfe8e2] hover:bg-[linear-gradient(180deg,#eefaf6_0%,#e4f5f1_100%)] hover:text-[#0f8e7e] hover:shadow-[0_18px_34px_rgba(20,119,110,0.09)]"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#5f6d79] shadow-[0_10px_24px_rgba(35,66,85,0.06)] transition group-hover:text-[#0f8e7e]">
              <Icon name={icon} className="h-5 w-5" />
            </div>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
