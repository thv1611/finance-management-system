import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import AuthMessage from "../components/auth/AuthMessage";
import LoadingState from "../components/common/LoadingState";
import TransactionSummaryCard from "../components/transactions/TransactionSummaryCard";
import TransactionsHeader from "../components/transactions/TransactionsHeader";
import TransactionsTable from "../components/transactions/TransactionsTable";
import TransactionsToolbar from "../components/transactions/TransactionsToolbar";
import {
  QuickShortcutsCard,
  SavingGoalsCard,
  WeeklyAIInsightsCard,
} from "../components/transactions/TransactionsWidgets";
import { getAuthSession } from "../lib/authSession";
import { formatCurrency } from "../lib/financeData";
import { deleteTransaction, getCategories, getTransactions } from "../lib/transactionsApi";

function getTransactionIcon(type) {
  return type === "income" ? "income" : "expense";
}

function mapTransactionRow(transaction) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    categoryId: transaction.category_id,
    category: transaction.category_name || "Uncategorized",
    title: transaction.title || "Untitled transaction",
    description: transaction.title || transaction.description || "Untitled transaction",
    note: transaction.description || "",
    account: "Unassigned",
    date: transaction.transaction_date,
    status: "Completed",
    icon: getTransactionIcon(transaction.type),
  };
}

const EMPTY_SUMMARY = {
  income: 0,
  expenses: 0,
  net: 0,
};

export default function TransactionsPage() {
  const { user } = getAuthSession();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    type: "all",
    datePreset: "all",
    startDate: "",
    endDate: "",
    categoryIds: [],
  });
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (isMounted) {
          setCategories(result.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setTone("error");
          setMessage(error.response?.message || error.message || "Unable to load categories.");
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setMessage("");

        const params = {
          page: pagination.page,
          pageSize: pagination.pageSize,
        };

        if (filters.type !== "all") {
          params.type = filters.type;
        }

        if (filters.datePreset && filters.datePreset !== "all") {
          params.datePreset = filters.datePreset;
        }

        if (filters.datePreset === "customRange") {
          if (filters.startDate && filters.endDate) {
            params.startDate = filters.startDate;
            params.endDate = filters.endDate;
          }
        }

        if (filters.categoryIds.length > 0) {
          params.categories = filters.categoryIds.join(",");
        }

        const result = await getTransactions(params);

        if (!isMounted) {
          return;
        }

        const payload = result.data || {};
        setTransactions((payload.items || []).map(mapTransactionRow));
        setSummary(payload.summary || EMPTY_SUMMARY);
        setPagination((prev) => ({
          ...prev,
          ...(payload.pagination || prev),
        }));
      } catch (error) {
        if (isMounted) {
          setTone("error");
          setMessage(error.response?.message || error.message || "Unable to load transactions.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [filters, pagination.page, pagination.pageSize, reloadKey]);

  const hasTransactions = pagination.totalCount > 0;
  const summaries = [
    ["dashboard", "Total Transactions", String(pagination.totalCount), hasTransactions ? "Live" : "0%", "positive"],
    ["income", "Monthly Income", formatCurrency(summary.income), hasTransactions ? "Live" : "0%", "positive"],
    ["expense", "Monthly Expenses", formatCurrency(summary.expenses), hasTransactions ? "Live" : "0%", hasTransactions ? "negative" : "positive"],
    ["wallet", "Net Balance", `${summary.net >= 0 ? "+" : "-"}${formatCurrency(summary.net)}`, hasTransactions ? "Live" : "0%", "positive"],
  ];

  function updateFilters(patch) {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }

  function handleToggleCategory(categoryId) {
    updateFilters({
      categoryIds: filters.categoryIds.includes(categoryId)
        ? filters.categoryIds.filter((id) => id !== categoryId)
        : [...filters.categoryIds, categoryId],
    });
  }

  async function handleDeleteTransaction(transactionId) {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(transactionId);
      await deleteTransaction(transactionId);
      setTone("neutral");
      setMessage("Transaction deleted successfully.");
      setReloadKey((prev) => prev + 1);
      setPagination((prev) => ({
        ...prev,
        page: prev.page > 1 && transactions.length === 1 ? prev.page - 1 : prev.page,
      }));
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to delete the transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Transactions" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8">
          <TransactionsHeader user={user} />

          <section className="mt-8">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
              Transactions
            </h1>
            <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#7a8794]">
              Track and manage your recent financial activity with real-time insights and advanced filtering.
            </p>
          </section>

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <LoadingState label="Loading transactions..." />
          ) : (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaries.map(([icon, title, value, trend, cardTone]) => (
                  <TransactionSummaryCard key={title} icon={icon} title={title} value={value} trend={trend} tone={cardTone} />
                ))}
              </section>

              <TransactionsToolbar
                activeType={filters.type}
                activeDatePreset={filters.datePreset}
                customStartDate={filters.startDate}
                customEndDate={filters.endDate}
                categories={categories}
                selectedCategoryIds={filters.categoryIds}
                onTypeChange={(type) => updateFilters({ type })}
                onDatePresetChange={(datePreset) =>
                  updateFilters({
                    datePreset,
                    ...(datePreset !== "customRange" ? { startDate: "", endDate: "" } : {}),
                  })
                }
                onCustomStartDateChange={(startDate) => updateFilters({ startDate })}
                onCustomEndDateChange={(endDate) => updateFilters({ endDate })}
                onClearDateFilter={() =>
                  updateFilters({
                    datePreset: "all",
                    startDate: "",
                    endDate: "",
                  })
                }
                onToggleCategory={handleToggleCategory}
                onClearCategories={() => updateFilters({ categoryIds: [] })}
              />

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.65fr)]">
                <TransactionsTable
                  transactions={transactions}
                  currentPage={pagination.page}
                  pageSize={pagination.pageSize}
                  totalCount={pagination.totalCount}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  onDelete={handleDeleteTransaction}
                  deletingId={deletingId}
                />
                <aside className="mt-6 space-y-6">
                  <WeeklyAIInsightsCard hasData={hasTransactions} />
                  <SavingGoalsCard hasData={hasTransactions} />
                  <QuickShortcutsCard />
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
