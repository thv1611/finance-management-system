import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { Icon } from "../components/dashboard/DashboardIcons";
import EditTransactionActions from "../components/transactions/EditTransactionActions";
import EditTransactionForm from "../components/transactions/EditTransactionForm";
import QuickTipCard from "../components/transactions/QuickTipCard";
import ReceiptPreviewCard from "../components/transactions/ReceiptPreviewCard";
import TransactionSummaryPanel from "../components/transactions/TransactionSummaryPanel";
import { getAuthSession } from "../lib/authSession";
import EmptyState from "../components/common/EmptyState";
import { useFinanceData } from "../lib/financeData";

export default function EditTransactionPage() {
  const { user } = getAuthSession();
  const { selectedTransaction } = useFinanceData();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Transactions" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 lg:py-8">
          <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
                Edit Transaction
              </h1>
              <p className="mt-2 text-base font-semibold text-[#7a8794]">
                Update transaction details and keep your records accurate
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="grid h-12 w-12 place-items-center rounded-full bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
                <Icon name="bell" className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-full bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]">
                <Icon name="info" className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </button>
            </div>
          </header>

          {selectedTransaction ? (
            <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
              <div>
                <EditTransactionForm transaction={selectedTransaction} />
                <EditTransactionActions />
              </div>

              <aside className="space-y-6">
                <TransactionSummaryPanel transaction={selectedTransaction} />
                <ReceiptPreviewCard receiptUrl={selectedTransaction.receiptUrl} />
                <QuickTipCard />
              </aside>
            </section>
          ) : (
            <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
              <EmptyState
                title="No transaction selected"
                message="Choose a transaction from your list before editing details."
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
