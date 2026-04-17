import { useEffect, useMemo, useState } from "react";
import { getDashboardBudgetSnapshot, getDashboardSummary, getRecentDashboardTransactions } from "../lib/dashboardApi";
import { getReportsSummary } from "../lib/reportsApi";
import {
  buildNotificationFeed,
  dismissNotification,
  getNotificationState,
  markNotificationsRead,
} from "../lib/notificationFeed";

const EMPTY_DASHBOARD_SUMMARY = {
  total_balance: 0,
  monthly_income: 0,
  monthly_expenses: 0,
  monthly_savings: 0,
};

const EMPTY_BUDGET_SNAPSHOT = {
  total_budgets: 0,
  overspent_categories_count: 0,
};

const EMPTY_REPORTS_SUMMARY = {
  totalIncome: 0,
  totalExpense: 0,
  savings: 0,
};

export function useNotificationFeed() {
  const [dashboardSummary, setDashboardSummary] = useState(EMPTY_DASHBOARD_SUMMARY);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetSnapshot, setBudgetSnapshot] = useState(EMPTY_BUDGET_SNAPSHOT);
  const [reportsSummary, setReportsSummary] = useState(EMPTY_REPORTS_SUMMARY);
  const [, setStateVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadFeedData() {
      const results = await Promise.allSettled([
        getDashboardSummary(),
        getRecentDashboardTransactions(),
        getDashboardBudgetSnapshot(),
        getReportsSummary(),
      ]);

      if (!isMounted) {
        return;
      }

      const [summaryResult, recentResult, budgetResult, reportsResult] = results;

      if (summaryResult.status === "fulfilled") {
        setDashboardSummary(summaryResult.value.data || EMPTY_DASHBOARD_SUMMARY);
      }

      if (recentResult.status === "fulfilled") {
        setRecentTransactions(recentResult.value.data || []);
      }

      if (budgetResult.status === "fulfilled") {
        setBudgetSnapshot(budgetResult.value.data || EMPTY_BUDGET_SNAPSHOT);
      }

      if (reportsResult.status === "fulfilled") {
        setReportsSummary(reportsResult.value.data || EMPTY_REPORTS_SUMMARY);
      }
    }

    loadFeedData();

    return () => {
      isMounted = false;
    };
  }, []);

  const notificationState = getNotificationState();
  const allItems = useMemo(
    () =>
      buildNotificationFeed({
        dashboardSummary,
        recentTransactions,
        budgetSnapshot,
        reportsSummary,
      }),
    [budgetSnapshot, dashboardSummary, recentTransactions, reportsSummary]
  );

  const items = useMemo(
    () => allItems.filter((item) => !notificationState.dismissedIds.includes(item.id)),
    [allItems, notificationState.dismissedIds]
  );

  const unreadCount = useMemo(
    () => items.filter((item) => !notificationState.readIds.includes(item.id)).length,
    [items, notificationState.readIds]
  );

  function handleOpenNotifications() {
    markNotificationsRead(items.map((item) => item.id));
    setStateVersion((prev) => prev + 1);
  }

  function handleDismissNotification(id) {
    dismissNotification(id);
    setStateVersion((prev) => prev + 1);
  }

  return {
    notifications: items,
    unreadCount,
    onOpenNotifications: handleOpenNotifications,
    onDismissNotification: handleDismissNotification,
  };
}
