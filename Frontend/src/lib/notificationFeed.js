const STORAGE_KEY = "notification_feed_state_v1";

function readState() {
  if (typeof window === "undefined") {
    return {
      readIds: [],
      dismissedIds: [],
    };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : {};

    return {
      readIds: Array.isArray(parsedValue.readIds) ? parsedValue.readIds : [],
      dismissedIds: Array.isArray(parsedValue.dismissedIds) ? parsedValue.dismissedIds : [],
    };
  } catch {
    return {
      readIds: [],
      dismissedIds: [],
    };
  }
}

function writeState(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function getNotificationState() {
  return readState();
}

export function markNotificationsRead(ids = []) {
  const state = readState();
  const nextIds = Array.from(new Set([...state.readIds, ...ids.filter(Boolean)]));
  writeState({
    ...state,
    readIds: nextIds,
  });
}

export function dismissNotification(id) {
  if (!id) {
    return;
  }

  const state = readState();
  writeState({
    readIds: Array.from(new Set([...state.readIds, id])),
    dismissedIds: Array.from(new Set([...state.dismissedIds, id])),
  });
}

export function buildNotificationFeed({
  dashboardSummary,
  recentTransactions = [],
  budgetSnapshot,
  reportsSummary,
}) {
  const notifications = [];
  const overspentCount = Number(budgetSnapshot?.overspent_categories_count || 0);
  const budgetCount = Number(budgetSnapshot?.total_budgets || 0);
  const recentCount = recentTransactions.length;
  const totalBalance = Number(dashboardSummary?.total_balance || 0);
  const monthlySavings = Number(dashboardSummary?.monthly_savings || 0);
  const reportSavings = Number(reportsSummary?.savings || 0);

  if (overspentCount > 0) {
    notifications.push({
      id: "overspent-budgets",
      title: `${overspentCount} budget ${overspentCount > 1 ? "categories need" : "category needs"} attention`,
      description: "Some budgets have already crossed their limit. Review them before your next expense.",
      to: "/budgets",
      icon: "wallet",
      tone: "danger",
    });
  } else if (budgetCount === 0) {
    notifications.push({
      id: "create-first-budget",
      title: "Create your first budget",
      description: "Set category limits now so future spending alerts can work automatically.",
      to: "/budgets",
      icon: "wallet",
      tone: "warning",
    });
  }

  if (recentCount > 0) {
    notifications.push({
      id: "recent-transactions",
      title: `${recentCount} recent transaction${recentCount > 1 ? "s are" : " is"} ready to review`,
      description: "Open your history to check the latest income and expenses that just landed.",
      to: "/transactions",
      icon: "history",
      tone: "positive",
    });
  } else {
    notifications.push({
      id: "add-first-transaction",
      title: "Add your first transaction",
      description: "Your dashboard, reports, and alerts become useful as soon as your first record is saved.",
      to: "/transactions/new",
      icon: "receipt",
      tone: "neutral",
    });
  }

  if (monthlySavings < 0 || reportSavings < 0) {
    notifications.push({
      id: "negative-savings",
      title: "Savings trend is negative",
      description: "Your recent outflow is stronger than your inflow. Check reports and rebalance fast-moving categories.",
      to: "/reports",
      icon: "report",
      tone: "warning",
    });
  }

  if (totalBalance > 0) {
    notifications.push({
      id: "cashflow-check",
      title: "Cash-flow trends are ready",
      description: "Use the latest data to inspect where your strongest inflow and outflow patterns are forming.",
      to: "/cash-flow-trends",
      icon: "ai",
      tone: "neutral",
    });
  }

  return notifications;
}
