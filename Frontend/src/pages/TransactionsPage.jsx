import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthMessage from "../components/auth/AuthMessage";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import TransactionSummaryCard from "../components/transactions/TransactionSummaryCard";
import TransactionsHeader from "../components/transactions/TransactionsHeader";
import TransactionsTable from "../components/transactions/TransactionsTable";
import TransactionsToolbar from "../components/transactions/TransactionsToolbar";
import {
  QuickShortcutsCard,
  SavingGoalsCard,
  WeeklyAIInsightsCard,
} from "../components/transactions/TransactionsWidgets";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
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

function parseCsvList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitialFilters(searchParams) {
  return {
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "all",
    datePreset: searchParams.get("datePreset") || "all",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    categoryIds: parseCsvList(searchParams.get("categories")),
  };
}

function getInitialPagination(searchParams) {
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 15,
    totalCount: 0,
    totalPages: 1,
  };
}

function buildTransactionsSearchParams(filters, pagination) {
  const next = new URLSearchParams();

  if (filters.search.trim()) {
    next.set("search", filters.search.trim());
  }

  if (filters.type !== "all") {
    next.set("type", filters.type);
  }

  if (filters.datePreset !== "all") {
    next.set("datePreset", filters.datePreset);
  }

  if (filters.datePreset === "customRange") {
    if (filters.startDate) {
      next.set("startDate", filters.startDate);
    }

    if (filters.endDate) {
      next.set("endDate", filters.endDate);
    }
  }

  if (filters.categoryIds.length > 0) {
    next.set("categories", filters.categoryIds.join(","));
  }

  if (pagination.page > 1) {
    next.set("page", String(pagination.page));
  }

  if (pagination.pageSize !== 15) {
    next.set("pageSize", String(pagination.pageSize));
  }

  return next;
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

function downloadCsv(filename, rows) {
  const content = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = getAuthSession();
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState(() => getInitialPagination(searchParams));
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    transactionId: null,
    transactionTitle: "",
  });
  const { page, pageSize, totalCount, totalPages } = pagination;

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
    const nextParams = buildTransactionsSearchParams(filters, { page, pageSize });
    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, page, pageSize, searchParams, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setMessage("");

        const params = {
          page,
          pageSize,
        };

        if (filters.search.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.type !== "all") {
          params.type = filters.type;
        }

        if (filters.datePreset !== "all") {
          params.datePreset = filters.datePreset;
        }

        if (filters.datePreset === "customRange" && filters.startDate && filters.endDate) {
          params.startDate = filters.startDate;
          params.endDate = filters.endDate;
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
  }, [filters, page, pageSize, reloadKey]);

  const hasTransactions = totalCount > 0;
  const summaries = [
    ["dashboard", "Total Transactions", String(totalCount), hasTransactions ? "Live" : "0%", "positive"],
    ["income", "Monthly Income", formatCurrency(summary.income), hasTransactions ? "Live" : "0%", "positive"],
    ["expense", "Monthly Expenses", formatCurrency(summary.expenses), hasTransactions ? "Live" : "0%", hasTransactions ? "negative" : "positive"],
    ["wallet", "Net Balance", `${summary.net >= 0 ? "+" : "-"}${formatCurrency(summary.net)}`, hasTransactions ? "Live" : "0%", "positive"],
  ];
  const listSearch = useMemo(() => {
    const params = buildTransactionsSearchParams(filters, { page, pageSize });
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters, page, pageSize]);

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

  function openDeleteDialog(transactionId) {
    const transaction = transactions.find((item) => item.id === transactionId);

    setConfirmState({
      isOpen: true,
      transactionId,
      transactionTitle: transaction?.title || transaction?.description || "this transaction",
    });
  }

  function closeDeleteDialog() {
    setConfirmState({
      isOpen: false,
      transactionId: null,
      transactionTitle: "",
    });
  }

  function handleExportTransactions() {
    if (transactions.length === 0) {
      setTone("error");
      setMessage("There are no transactions to export.");
      return;
    }

    downloadCsv("transactions-report.csv", [
      ["Title", "Category", "Type", "Amount", "Date", "Description", "Status"],
      ...transactions.map((transaction) => [
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.amount,
        transaction.date,
        transaction.note,
        transaction.status,
      ]),
    ]);

    setTone("neutral");
    setMessage("Transactions exported as CSV.");
  }

  function handleToggleCategory(categoryId) {
    const normalizedCategoryId = String(categoryId);

    updateFilters({
      categoryIds: filters.categoryIds.includes(normalizedCategoryId)
        ? filters.categoryIds.filter((id) => id !== normalizedCategoryId)
        : [...filters.categoryIds, normalizedCategoryId],
    });
  }

  async function handleDeleteTransaction() {
    if (!confirmState.transactionId) {
      return;
    }

    try {
      setDeletingId(confirmState.transactionId);
      await deleteTransaction(confirmState.transactionId);
      setTone("neutral");
      setMessage("Transaction deleted successfully.");
      closeDeleteDialog();
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
          <TransactionsHeader
            user={user}
            searchValue={filters.search}
            onSearchChange={(event) => updateFilters({ search: event.target.value })}
            addTransactionHref={`/transactions/new${listSearch}`}
            notifications={notifications}
            unreadCount={unreadCount}
            onOpenNotifications={onOpenNotifications}
            onDismissNotification={onDismissNotification}
          />

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
                onExport={handleExportTransactions}
              />

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.65fr)]">
                <TransactionsTable
                  transactions={transactions}
                  currentPage={page}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  addTransactionHref={`/transactions/new${listSearch}`}
                  editTransactionHref={(transactionId) =>
                    `/transactions/edit?id=${transactionId}${listSearch ? `&${listSearch.slice(1)}` : ""}`
                  }
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  onDelete={openDeleteDialog}
                  deletingId={deletingId}
                />
                <aside className="mt-6 space-y-6">
                  <WeeklyAIInsightsCard hasData={hasTransactions} />
                  <SavingGoalsCard hasData={hasTransactions} summary={summary} />
                  <QuickShortcutsCard />
                </aside>
              </section>
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete this transaction?"
        description={`This will permanently remove ${confirmState.transactionTitle} from your records.`}
        confirmLabel="Delete Transaction"
        isConfirming={Boolean(deletingId)}
        onConfirm={handleDeleteTransaction}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
