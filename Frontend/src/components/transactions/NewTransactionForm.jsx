import { Icon } from "../dashboard/DashboardIcons";
import FormField from "./FormField";
import { SelectInput } from "./TransactionInput";

function TypeToggle() {
  return (
    <div className="mx-auto mt-6 grid max-w-[320px] grid-cols-2 rounded-lg bg-[#eff4f6] p-1.5">
      {["Expense", "Income"].map((type) => {
        const active = type === "Expense";

        return (
          <button
            key={type}
            type="button"
            className={`rounded-md px-4 py-3 text-sm font-black transition ${
              active
                ? "bg-[#26333e] text-white shadow-[0_12px_26px_rgba(38,51,62,0.16)]"
                : "text-[#7d8a96] hover:bg-white/75 hover:text-[#26333e]"
            }`}
          >
            {type}
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
      onChange={() => {}}
      className={`h-12 w-full rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 text-sm font-bold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white ${className}`}
      {...props}
    />
  );
}

function AiSuggestionBanner() {
  return (
    <div className="rounded-lg bg-[#edf9f5] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(19,151,127,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#13977f] text-white">
            <Icon name="ai" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#13977f]">AI Suggestion</p>
            <p className="mt-1 text-sm font-black text-[#31404b]">Likely Dining based on 12:45 PM</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg bg-white px-4 py-2 text-sm font-black text-[#13977f] shadow-[0_10px_22px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:bg-[#13977f] hover:text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function AttachmentArea() {
  return (
    <button
      type="button"
      className="flex min-h-[135px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#d4e1e5] bg-[#fbfdfe] px-5 py-6 text-center transition hover:border-[#13977f] hover:bg-[#f2faf8]"
    >
      <Icon name="upload" className="h-5 w-5 text-[#7c8a96]" />
      <span className="mt-4 text-sm font-black text-[#2d3a45]">Attach Receipt or Document</span>
      <span className="mt-1 text-xs font-semibold text-[#9aa6b2]">PDF, JPG, PNG up to 10MB</span>
    </button>
  );
}

export default function NewTransactionForm() {
  return (
    <section className="mx-auto mt-8 max-w-[760px] rounded-lg bg-white p-6 shadow-[0_28px_70px_rgba(35,66,85,0.075)] md:p-8">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38]">New Transaction</h1>
        <p className="mt-2 text-sm font-semibold text-[#7a8794]">
          Add a new record to your digital sanctuary
        </p>
      </div>

      <form className="mt-8 space-y-6">
        <div className="rounded-lg bg-[#f6fafb] px-5 py-7 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#9aa6b2]">Transaction Amount</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-[#6f7c88]">$</span>
            <input
              value="0.00"
              onChange={() => {}}
              aria-label="Transaction amount"
              className="w-[180px] bg-transparent text-center text-6xl font-black tracking-[-0.07em] text-[#1f2d38] outline-none"
            />
          </div>
          <TypeToggle />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Category">
            <SelectInput value="Select a category">
              <option>Select a category</option>
              <option>Dining</option>
              <option>Shopping</option>
            </SelectInput>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date">
              <PlainInput value="11/24/2023" aria-label="Date" />
            </FormField>
            <FormField label="Time">
              <PlainInput value="12:45 PM" aria-label="Time" />
            </FormField>
          </div>
        </div>

        <AiSuggestionBanner />

        <FormField label="Account / Wallet">
          <SelectInput value="Main Savings Bank">
            <option>Main Savings Bank</option>
            <option>Main Wallet</option>
            <option>Credit Card</option>
          </SelectInput>
        </FormField>

        <FormField label="Note">
          <textarea
            placeholder="Add some context to this flow..."
            className="min-h-[110px] w-full resize-none rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a5afb8] focus:border-[#8fd8cd] focus:bg-white"
          />
        </FormField>

        <AttachmentArea />

        <div className="pt-2 text-center">
          <button
            type="button"
            className="h-12 w-full max-w-[310px] rounded-full bg-gradient-to-r from-[#087d6f] to-[#78dcc7] text-sm font-black text-white shadow-[0_18px_38px_rgba(15,143,131,0.24)] transition hover:-translate-y-0.5"
          >
            Save Transaction
          </button>
        </div>
      </form>
    </section>
  );
}
