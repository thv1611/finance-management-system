import FormField from "./FormField";
import ReceiptUploadBox from "./ReceiptUploadBox";
import { SelectInput, TextInput } from "./TransactionInput";
import TransactionTypeToggle from "./TransactionTypeToggle";

export default function EditTransactionForm({ transaction }) {
  const transactionType = transaction?.type === "income" ? "Income" : "Expense";

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
      <form className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Amount">
            <TextInput prefix="$" value={String(Math.abs(Number(transaction?.amount || 0)).toFixed(2))} aria-label="Amount" />
          </FormField>

          <FormField label="Transaction Type">
            <TransactionTypeToggle activeType={transactionType} />
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Category">
            <SelectInput value="Shopping">
              <option>{transaction?.category || "Uncategorized"}</option>
            </SelectInput>
          </FormField>

          <FormField label="Account">
            <SelectInput value={transaction?.account || "Unassigned"}>
              <option>{transaction?.account || "Unassigned"}</option>
            </SelectInput>
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Date & Time">
            <TextInput value={transaction?.dateTime || transaction?.date || ""} aria-label="Date and time" />
          </FormField>

          <FormField label="Reference Note">
            <TextInput value={transaction?.note || transaction?.description || ""} aria-label="Reference note" />
          </FormField>
        </div>

        <FormField label="Attachment / Receipt">
          <ReceiptUploadBox />
        </FormField>
      </form>
    </section>
  );
}
