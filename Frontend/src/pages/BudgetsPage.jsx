import { useEffect, useMemo, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetDecorPanel from "../components/budgets/BudgetDecorPanel";
import BudgetFormModal from "../components/budgets/BudgetFormModal";
import BudgetTimeline from "../components/budgets/BudgetTimeline";
import CategoryLimitsCard from "../components/budgets/CategoryLimitsCard";
import RecentAlertsCard from "../components/budgets/RecentAlertsCard";
import SmartInsightCard from "../components/budgets/SmartInsightCard";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { getAuthSession } from "../lib/authSession";
import { createBudget, deleteBudget, getBudgets, updateBudget } from "../lib/budgetsApi";
import { formatCurrency, getBudgetSummary } from "../lib/financeData";
import { getCategories } from "../lib/transactionsApi";

function getCurrentPeriod() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function getMonthLabel(month, year) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function buildTimelineMilestones(summary, month, year, budgetCount) {
  return [
    {
      id: "period",
      date: "Selected Period",
      label: getMonthLabel(month, year),
    },
    {
      id: "limit",
      date: "Budgeted",
      label: formatCurrency(summary.totalBudget),
    },
    {
      id: "spent",
      date: "Spent",
      label: formatCurrency(summary.totalSpent),
    },
    {
      id: "count",
      date: "Categories",
      label: `${budgetCount} Active`,
    },
  ];
}

export default function BudgetsPage() {
  const { user } = getAuthSession();
  const currentPeriod = useMemo(() => getCurrentPeriod(), []);
  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, index) => currentPeriod.year - 5 + index),
    [currentPeriod.year]
  );
  const [filters, setFilters] = useState(currentPeriod);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [reloadKey, setReloadKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmBudget, setConfirmBudget] = useState(null);
  const budgetSummary = getBudgetSummary(budgets);
  const alerts = budgets
    .filter((budget) => budget.overspent || Number(budget.progress || 0) >= 80)
    .slice(0, 3)
    .map((budget) => ({
      id: budget.id,
      title: budget.overspent
        ? `${budget.category_name} is over budget`
        : `${budget.category_name} is nearing its limit`,
      description: budget.overspent
        ? `Exceeded by ${formatCurrency(Math.abs(Number(budget.remaining || 0)))}`
        : `${Math.round(Number(budget.progress || 0))}% of the limit has been used.`,
      color: budget.overspent ? "#dd4d58" : "#e39d28",
    }));
  const summaryCards = [
    ["Total Budget", formatCurrency(budgetSummary.totalBudget)],
    ["Total Spent", formatCurrency(budgetSummary.totalSpent)],
    ["Remaining", formatCurrency(budgetSummary.remaining)],
    ["Overspent", String(budgetSummary.overspent), "Categories", "warning"],
  ];
  const timelineMilestones = buildTimelineMilestones(
    budgetSummary,
    filters.month,
    filters.year,
    budgets.length
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const result = await getCategories("expense");

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

    async function loadBudgets() {
      try {
        setIsLoading(true);
        setMessage("");
        const result = await getBudgets(filters);

        if (isMounted) {
          setBudgets(result.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setTone("error");
          setMessage(error.response?.message || error.message || "Unable to load budgets.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBudgets();

    return () => {
      isMounted = false;
    };
  }, [filters, reloadKey]);

  function openCreateModal() {
    setFormMode("create");
    setEditingBudget({
      category_id: "",
      month: filters.month,
      year: filters.year,
      amount_limit: "",
    });
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(budget) {
    setFormMode("edit");
    setEditingBudget(budget);
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingBudget(null);
    setSubmitError("");
  }

  async function handleSubmitBudget(payload) {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (formMode === "edit" && editingBudget?.id) {
        await updateBudget(editingBudget.id, payload);
        setTone("neutral");
        setMessage("Budget updated successfully.");
      } else {
        await createBudget(payload);
        setTone("neutral");
        setMessage("Budget created successfully.");
      }

      setIsModalOpen(false);
      setEditingBudget(null);
      setSubmitError("");
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      setSubmitError(error.response?.message || error.message || "Unable to save budget.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBudget() {
    if (!confirmBudget) {
      return;
    }

    try {
      setDeletingId(confirmBudget.id);
      await deleteBudget(confirmBudget.id);
      setTone("neutral");
      setMessage("Budget deleted successfully.");
      setConfirmBudget(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to delete budget.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="Budgets" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:py-8">
          <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">Budgets</h1>
              <p className="mt-2 text-base font-semibold text-[#7a8794]">
                Plan spending limits and maintain your financial sanctuary.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={filters.month}
                onChange={(event) => setFilters((prev) => ({ ...prev, month: Number(event.target.value) }))}
                className="rounded-lg border border-[#d7e2e6] bg-white px-4 py-3 text-sm font-black text-[#34424d] outline-none transition focus:border-[#13977f]"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <option key={month} value={month}>
                    {getMonthLabel(month, filters.year).split(" ")[0]}
                  </option>
                ))}
              </select>
              <select
                value={filters.year}
                onChange={(event) => setFilters((prev) => ({ ...prev, year: Number(event.target.value) }))}
                className="rounded-lg border border-[#d7e2e6] bg-white px-4 py-3 text-sm font-black text-[#34424d] outline-none transition focus:border-[#13977f]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={openCreateModal}
                className="w-fit rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f]"
              >
                + Create Budget
              </button>
            </div>
          </header>

          <AuthMessage tone={tone} message={message} />

          {isLoading ? (
            <LoadingState label="Loading budgets..." />
          ) : budgets.length > 0 ? (
            <BudgetTimeline milestones={timelineMilestones} />
          ) : (
            <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
              <EmptyState
                title="No budgets yet"
                message={`No budgets found for ${getMonthLabel(filters.month, filters.year)}. Create one to start tracking spending progress.`}
                actionLabel="+ Create Budget"
                onAction={openCreateModal}
              />
            </section>
          )}

          {!isLoading && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(([title, value, subtitle, tone]) => (
                  <BudgetCard key={title} title={title} value={value} subtitle={subtitle} tone={tone} />
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.9fr)]">
                <CategoryLimitsCard
                  budgets={budgets}
                  onCreateBudget={openCreateModal}
                  onEditBudget={openEditModal}
                  onDeleteBudget={setConfirmBudget}
                  deletingId={deletingId}
                />
                <div className="space-y-6">
                  <SmartInsightCard hasData={budgets.length > 0} />
                  <RecentAlertsCard alerts={alerts} />
                  <BudgetDecorPanel remaining={budgetSummary.remaining} />
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <BudgetFormModal
        key={`${formMode}-${editingBudget?.id ?? "new"}-${isModalOpen ? "open" : "closed"}`}
        isOpen={isModalOpen}
        mode={formMode}
        categories={categories}
        initialValues={editingBudget}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={closeModal}
        onSubmit={handleSubmitBudget}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmBudget)}
        title="Delete this budget?"
        description={
          confirmBudget
            ? `This will remove the budget for ${confirmBudget.category_name} in ${getMonthLabel(confirmBudget.month, confirmBudget.year)}.`
            : ""
        }
        confirmLabel="Delete Budget"
        isConfirming={Boolean(deletingId)}
        onConfirm={handleDeleteBudget}
        onCancel={() => setConfirmBudget(null)}
      />
    </div>
  );
}
