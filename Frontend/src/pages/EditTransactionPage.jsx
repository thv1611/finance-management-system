import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthMessage from "../components/auth/AuthMessage";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingState from "../components/common/LoadingState";
import NotificationMenu from "../components/common/NotificationMenu";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { Icon } from "../components/dashboard/DashboardIcons";
import EditTransactionActions from "../components/transactions/EditTransactionActions";
import EditTransactionForm from "../components/transactions/EditTransactionForm";
import QuickTipCard from "../components/transactions/QuickTipCard";
import ReceiptPreviewCard from "../components/transactions/ReceiptPreviewCard";
import TransactionSummaryPanel from "../components/transactions/TransactionSummaryPanel";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";
import EmptyState from "../components/common/EmptyState";
import { deleteTransaction, getCategories, getTransactionById, updateTransaction } from "../lib/transactionsApi";

export default function EditTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const transactionId = Number(searchParams.get("id"));
  const returnParams = new URLSearchParams(searchParams);
  returnParams.delete("id");
  const returnSearch = returnParams.toString() ? `?${returnParams.toString()}` : "";
  const [transaction, setTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTransaction() {
      if (!transactionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [transactionResult, categoriesResult] = await Promise.all([
          getTransactionById(transactionId),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        const transactionData = transactionResult.data;
        setTransaction({
          ...transactionData,
          amount: Number(transactionData.amount || 0),
          date: transactionData.transaction_date,
          createdAt: transactionData.created_at,
          receiptUrl: transactionData.receipt_url || null,
        });
        setCategories(categoriesResult.data || []);
      } catch (error) {
        if (isMounted) {
          setTone("error");
          setMessage(error.response?.message || error.message || "Unable to load the transaction.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTransaction();

    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  async function handleSave(payload) {
    try {
      setIsSaving(true);
      setMessage("");
      const result = await updateTransaction(transactionId, payload);
      setTransaction({
        ...result.data,
        amount: Number(result.data.amount || 0),
        date: result.data.transaction_date,
        createdAt: result.data.created_at,
        receiptUrl: result.data.receipt_url || null,
      });
      setTone("neutral");
      setMessage("Transaction updated successfully.");
      window.setTimeout(() => {
        navigate(`/transactions${returnSearch}`);
      }, 700);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to update the transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteTransaction(transactionId);
      setIsDeleteDialogOpen(false);
      navigate(`/transactions${returnSearch}`);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to delete the transaction.");
    } finally {
      setIsDeleting(false);
    }
  }

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
              <NotificationMenu
                items={notifications}
                unreadCount={unreadCount}
                onOpen={onOpenNotifications}
                onDismiss={onDismissNotification}
                buttonClassName="grid h-12 w-12 place-items-center rounded-full bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
              />
            </div>
          </header>

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <section className="mt-8">
              <LoadingState label="Loading transaction details..." />
            </section>
          ) : transaction ? (
            <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
              <div>
                <EditTransactionForm
                  key={`${transaction.id}-${transaction.updated_at || transaction.createdAt || "initial"}`}
                  transaction={transaction}
                  categories={categories}
                  onSubmit={handleSave}
                  isSubmitting={isSaving}
                />
                <EditTransactionActions
                  onDelete={() => setIsDeleteDialogOpen(true)}
                  onCancel={() => navigate(`/transactions${returnSearch}`)}
                  isDeleting={isDeleting}
                  isSubmitting={isSaving}
                  formId="edit-transaction-form"
                />
              </div>

              <aside className="space-y-6">
                <TransactionSummaryPanel transaction={transaction} />
                <ReceiptPreviewCard receiptUrl={transaction.receiptUrl} />
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete this transaction?"
        description={`This will permanently remove ${transaction?.title || "this transaction"} from your history.`}
        confirmLabel="Delete Transaction"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
