import { request } from "./apiClient";

export function getDashboardSummary() {
  return request("/dashboard/summary");
}

export function getRecentDashboardTransactions() {
  return request("/dashboard/recent-transactions");
}

export function getDashboardBudgetSnapshot() {
  return request("/dashboard/budget-snapshot");
}

export function getDashboardSpendingAnalytics(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return request(`/dashboard/spending-analytics${query ? `?${query}` : ""}`);
}
